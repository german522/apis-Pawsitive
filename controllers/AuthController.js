const { PersonaRepository, ClienteRepository, VeterinarioRepository } = require('../repositories');
const ApiResponse = require('../utils/ApiResponse');
const { sequelize } = require('../models');
const { pendingVerifications } = require('./ClienteController');
const AuthUtils = require('../utils/auth');
const { ValidationError, DatabaseError } = require('sequelize');

exports.verifyCode = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { correo, codigo_verificacion } = req.body;

    if (!correo || !codigo_verificacion) {
      return ApiResponse.validation("Correo y código de verificación son requeridos.", null, res);
    }

    const pendingData = pendingVerifications.get(correo);
    if (!pendingData) {
      return ApiResponse.notFound("No hay registro pendiente para este correo o ya fue verificado.", res);
    }

    if (pendingData.codigoVerificacion !== codigo_verificacion) {
      return ApiResponse.validation("El código de verificación es incorrecto.", null, res);
    }

    if (new Date() > new Date(pendingData.codigoExpiracion)) {
      pendingVerifications.delete(correo);
      return ApiResponse.validation("El código de verificación ha expirado. Regístrate nuevamente.", null, res);
    }

    // Crear persona
    const persona = await PersonaRepository.create({
      nombre: pendingData.nombre.trim(),
      apellido_paterno: pendingData.apellido_paterno.trim(),
      apellido_materno: pendingData.apellido_materno?.trim() || null,
      telefono: pendingData.telefono?.trim() || null,
      correo: pendingData.correo,
      contrasena: pendingData.contrasena,
      URL_imagen: pendingData.URL_imagen?.trim() || null,
      verificado: true,
      codigo_verificacion: null,
      codigo_expiracion: null
    }, { transaction });

    // Crear registro según tipo
    if (pendingData.tipo === 'cliente') {
      await ClienteRepository.create({
        id_persona: persona.id,
        fecha_registro: new Date()
      }, { transaction });
    } else if (pendingData.tipo === 'veterinario') {
      await VeterinarioRepository.create({
        id_persona: persona.id,
        cedula: pendingData.cedula.trim(),
        especialidad: pendingData.especialidad?.trim() || null
      }, { transaction });
    }

    await transaction.commit();
    pendingVerifications.delete(correo);

    return ApiResponse.success(
      "Cuenta verificada y registrada exitosamente. Ya puedes iniciar sesión.",
      { correo: persona.correo },
      res,
      201
    );

  } catch (error) {
    await transaction.rollback();
    console.error("Error en POST /auth/verify-code:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};;


// Login único para clientes y veterinarios
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return ApiResponse.validation("Correo y contraseña son requeridos.", null, res);
    }

    // Buscar persona por correo (asegúrate de incluir las asociaciones)
    const persona = await PersonaRepository.getByCorreo(correo);
    if (!persona) {
      return ApiResponse.unauthorized("Credenciales incorrectas.", res);
    }

    // Verificar si la cuenta está verificada
    if (!persona.verificado) {
      return ApiResponse.unauthorized("Debes verificar tu correo antes de iniciar sesión.", res);
    }

    // Verificar contraseña
    const passwordMatch = await AuthUtils.comparePassword(contrasena, persona.contrasena);
    if (!passwordMatch) {
      return ApiResponse.unauthorized("Credenciales incorrectas.", res);
    }

    // Determinar tipo de usuario (cliente o veterinario)
    let userType = null;
    let userTypeId = null;
    let additionalData = {};

    // Cliente
    if (persona.cliente) {
      userType = 'cliente';
      userTypeId = persona.cliente.id;
      additionalData = {
        fecha_registro: persona.cliente.fecha_registro
      };
    }
    // Veterinario
    else if (persona.veterinario) {
      userType = 'veterinario';
      userTypeId = persona.veterinario.id;
      additionalData = {
        cedula: persona.veterinario.cedula,
        especialidad: persona.veterinario.especialidad
      };
    } else {
      return ApiResponse.unauthorized("Usuario no tiene un tipo válido asignado.", res);
    }

    // Generar tokens
    const token = AuthUtils.generateToken(persona, userType, userTypeId);
    const refreshToken = AuthUtils.generateRefreshToken(persona);

    const responseData = {
      user: {
        id: persona.id,
        nombre: persona.nombre,
        apellido_paterno: persona.apellido_paterno,
        apellido_materno: persona.apellido_materno,
        correo: persona.correo,
        telefono: persona.telefono,
        URL_imagen: persona.URL_imagen,
        tipo: userType,
        ...additionalData
      },
      tokens: {
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: '24h'
      }
    };

    return ApiResponse.success("Login exitoso.", responseData, res);

  } catch (error) {
    console.error("Error en POST /auth/login:", error);

    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Verificar token
exports.verifyToken = async (req, res) => {
  try {
    return ApiResponse.success("Token válido.", { user: req.user }, res);
  } catch (error) {
    console.error("Error en GET /auth/verify:", error);
    return ApiResponse.error("Error al verificar token.", res);
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.validation("Refresh token requerido.", null, res);
    }

    // Verificar refresh token
    const decoded = AuthUtils.verifyToken(refreshToken);
    const persona = await PersonaRepository.getById(decoded.id);

    if (!persona) {
      return ApiResponse.unauthorized("Usuario no válido.", res);
    }

    // Determinar tipo de usuario
    let userType = null;
    let userTypeId = null;

    if (persona.cliente) {
      userType = 'cliente';
      userTypeId = persona.cliente.id;
    } else if (persona.veterinario) {
      userType = 'veterinario';
      userTypeId = persona.veterinario.id;
    }

    // Generar nuevo access token
    const newToken = AuthUtils.generateToken(persona, userType, userTypeId);

    const responseData = {
      accessToken: newToken,
      expiresIn: '24h'
    };

    return ApiResponse.success("Token renovado exitosamente.", responseData, res);

  } catch (error) {
    console.error("Error en POST /auth/refresh:", error);
    return ApiResponse.unauthorized("Refresh token inválido.", res);
  }
};