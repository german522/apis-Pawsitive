const { PersonaRepository, ClienteRepository, VeterinarioRepository } = require('../repositories');
const AuthUtils = require('../utils/auth');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');
const VerificationUtils = require('../utils/verification');

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

    // Bloquear login si la cuenta no está verificada
    if (!persona.verificado) {
      return ApiResponse.unauthorized("Cuenta no verificada. Revisa tu correo y verifica tu cuenta.", res);
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
};

exports.verifyCode = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    // Validaciones básicas
    if (!correo || !codigo) {
      return ApiResponse.validation("Correo y código son requeridos.", null, res);
    }

    // Buscar persona por correo
    const persona = await PersonaRepository.getByCorreo(correo);
    if (!persona) {
      return ApiResponse.notFound("No se encontró una cuenta con ese correo.", res);
    }

    // Verificar si ya está verificado
    if (persona.verificado) {
      return ApiResponse.conflict("Esta cuenta ya ha sido verificada.", res);
    }

    // Verificar que tenga un código asignado
    if (!persona.codigo_verificacion) {
      return ApiResponse.error("No hay un código de verificación pendiente para esta cuenta.", res);
    }

    // Verificar que el código no haya expirado
    if (VerificationUtils.isExpired(persona.codigo_expiracion)) {
      return ApiResponse.unauthorized("El código de verificación ha expirado. Por favor solicita uno nuevo.", res);
    }

    // Verificar que el código sea correcto
    if (persona.codigo_verificacion !== codigo) {
      return ApiResponse.unauthorized("El código de verificación es incorrecto.", res);
    }

    // Actualizar persona: marcar como verificado y limpiar código
    await PersonaRepository.update(persona.id, {
      verificado: true,
      codigo_verificacion: null,
      codigo_expiracion: null
    });

    // Si la persona no tiene un tipo asignado (cliente/veterinario), y proviene de un registro de cliente,
    // crear el registro en la tabla `clientes` ahora que el correo está verificado.
    const personaActualizada = await PersonaRepository.getByCorreo(correo);

    if (!personaActualizada.cliente && !personaActualizada.veterinario) {
      // Crear cliente asociado
      const cliente = await ClienteRepository.create({ id_persona: personaActualizada.id, fecha_registro: new Date() });
      // Re-obtener persona con relaciones completas
      // (PersonaRepository.getByCorreo incluirá ahora la relación cliente)
    }

    // Obtener persona actualizada con relaciones
    const personaVerificada = await PersonaRepository.getByCorreo(correo);

    // Determinar tipo de usuario y generar tokens
    let userType = null;
    let userTypeId = null;
    let additionalData = {};

    if (personaVerificada.cliente) {
      userType = 'cliente';
      userTypeId = personaVerificada.cliente.id;
      additionalData = {
        fecha_registro: personaVerificada.cliente.fecha_registro
      };
    } else if (personaVerificada.veterinario) {
      userType = 'veterinario';
      userTypeId = personaVerificada.veterinario.id;
      additionalData = {
        cedula: personaVerificada.veterinario.cedula,
        especialidad: personaVerificada.veterinario.especialidad
      };
    }

    // Generar tokens automáticamente
    const token = AuthUtils.generateToken(personaVerificada, userType, userTypeId);
    const refreshToken = AuthUtils.generateRefreshToken(personaVerificada);

    const responseData = {
      user: {
        id: personaVerificada.id,
        nombre: personaVerificada.nombre,
        apellido_paterno: personaVerificada.apellido_paterno,
        apellido_materno: personaVerificada.apellido_materno,
        correo: personaVerificada.correo,
        telefono: personaVerificada.telefono,
        URL_imagen: personaVerificada.URL_imagen,
        tipo: userType,
        verificado: true,
        ...additionalData
      },
      tokens: {
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: '24h'
      }
    };

    return ApiResponse.success("Cuenta verificada exitosamente. Has iniciado sesión automáticamente.", responseData, res);

  } catch (error) {
    console.error("❌ Error en POST /auth/verify-code:", error);

    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};