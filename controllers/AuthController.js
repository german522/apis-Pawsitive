const { PersonaRepository, ClienteRepository, VeterinarioRepository } = require('../repositories');
const AuthUtils = require('../utils/auth');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');
const { usuario } = require('../models');

// Login único para clientes y veterinarios
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return ApiResponse.validation("Correo y contraseña son requeridos.", null, res);
    }

    // Buscar persona por correo
    const persona = await PersonaRepository.getByCorreo(correo);
    if (!persona) {
      return ApiResponse.unauthorized("Credenciales incorrectas.", res);
    }
    // verificar si el usuario esta confirmado en la tabla usuario
    const usuarioDB = await usuario.findOne({ where: { correo: persona.correo } });
    if (!usuarioDB){
      return ApiResponse.unauthorized("Usuario no encontrado en el sistema.", res);
    }
    if (!usuarioDB.confirmado) {
      return ApiResponse.unauthorized("Debes verificar tu correo antes de iniciar sesión.", res);
    }
    if (!usuarioDB.activo) {
     return ApiResponse.unauthorized("Tu cuenta aún no está activa. Contacta al administrador.", res);
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

    // Verificar si es cliente
    if (persona.cliente) {
      userType = 'cliente';
      userTypeId = persona.cliente.id;
      additionalData = {
        fecha_registro: persona.cliente.fecha_registro
      };
    }
    // Verificar si es veterinario
    else if (persona.veterinario) {
      userType = 'veterinario';
      userTypeId = persona.veterinario.id;
      additionalData = {
        cedula: persona.veterinario.cedula,
        especialidad: persona.veterinario.especialidad
      };
    }
    else {
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
        tipo: userType
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
}; //vrificar codigo
exports.verifyCode = async (req, res) => {
  try {
    const { correo, codigo_verificacion } = req.body;

    if (!correo || !codigo_verificacion) {
      return ApiResponse.validation("Correo y código de verificación son requeridos.", null, res);
    }

    const persona = await PersonaRepository.getByCorreo(correo);

    if (!persona) {
      return ApiResponse.notFound("No se encontró una cuenta con ese correo.", res);
    }

    if (persona.codigo_verificacion !== codigo_verificacion) {
      return ApiResponse.validation("El código de verificación es incorrecto.", null, res);
    }

    // Actualiza para marcar como verificado y limpiar códigos
    await PersonaRepository.update(persona.id, {
      verificado: true,
      codigo_verificacion: null,
      codigo_expiracion: null
    });

    return ApiResponse.success("Código verificado correctamente. Usuario activado.", null, res);

  } catch (error) {
    console.error("Error en POST /auth/verify-code:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};
