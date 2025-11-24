const { PersonaRepository, ClienteRepository, VeterinarioRepository } = require('../repositories');
const ApiResponse = require('../utils/ApiResponse');
const { sequelize } = require('../models');
const { pendingVerifications } = require('./ClienteController');
const AuthUtils = require('../utils/auth');
const { ValidationError, DatabaseError } = require('sequelize');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

const MAX_ATTEMPTS = 5;

exports.verifyCode = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { correo, codigo_verificacion } = req.body;

    if (!correo || !codigo_verificacion) {
      return ApiResponse.validation(
        "Correo y código de verificación son requeridos.",
        null,
        res
      );
    }

    const email = String(correo).toLowerCase().trim();
    const pending = pendingVerifications.get(email);

    if (!pending) {
      return ApiResponse.notFound(
        "No hay registro pendiente para este correo o ya fue verificado.",
        res
      );
    }

    // Control de intentos
    pending.attempts = pending.attempts || 0;
    if (pending.attempts >= MAX_ATTEMPTS) {
      pendingVerifications.delete(email);
      return ApiResponse.validation(
        "Se excedió el número de intentos de verificación. Inicia el registro nuevamente.",
        null,
        res
      );
    }

    // Verificar expiración
    const now = new Date();
    const exp = new Date(pending.codigoExpiracion);
    if (now > exp) {
      pendingVerifications.delete(email);
      return ApiResponse.validation(
        "El código de verificación ha expirado. Regístrate nuevamente.",
        null,
        res
      );
    }

    // Comparación directa (sin hash)
    const codeOk =
      pending.codigoVerificacion === codigo_verificacion ||
      pending.codigoPlano === codigo_verificacion;

    if (!codeOk) {
      pending.attempts += 1;
      pendingVerifications.set(email, pending);
      return ApiResponse.validation(
        "El código de verificación es incorrecto.",
        { intentos_restantes: Math.max(0, MAX_ATTEMPTS - pending.attempts) },
        res
      );
    }

    // === Crear Persona y rol ===
    const persona = await PersonaRepository.create({
      nombre: pending.nombre.trim(),
      apellido_paterno: pending.apellido_paterno.trim(),
      apellido_materno: pending.apellido_materno?.trim() || null,
      telefono: pending.telefono?.trim() || null,
      correo: pending.correo,
      contrasena: pending.contrasena,
      URL_imagen: pending.URL_imagen?.trim() || null,
      verificado: true,
      codigo_verificacion: null,
      codigo_expiracion: null
    }, { transaction });

    if (pending.tipo === 'cliente') {
      await ClienteRepository.create({
        id_persona: persona.id,
        fecha_registro: new Date()
      }, { transaction });
    } else if (pending.tipo === 'veterinario') {
      await VeterinarioRepository.create({
        id_persona: persona.id,
        cedula: pending.cedula?.trim(),
        especialidad: pending.especialidad?.trim() || null
      }, { transaction });
    }

    await transaction.commit();
    pendingVerifications.delete(email);

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
};

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

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return ApiResponse.validation("El correo es requerido.", null, res);
    }

    const email = String(correo).toLowerCase().trim();

    const persona = await PersonaRepository.getByCorreo(email);

    if (!persona || !persona.verificado) {
      return ApiResponse.success(
        "Si el correo está registrado, se enviará un enlace para recuperar la contraseña.",
        null,
        res
      );
    }

    // Generar token aleatorio
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token y expiración en la persona
    await PersonaRepository.saveResetToken(persona.id, token, expiresAt);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await emailService.sendPasswordResetEmail(persona.correo, resetLink);

    return ApiResponse.success(
      "Si el correo está registrado, se enviará un enlace para recuperar la contraseña.",
      null,
      res
    );
  } catch (error) {
    console.error("Error en POST /auth/forgot-password:", error);
    return ApiResponse.error("Error al procesar la solicitud de recuperación.", res);
  }
};

// Establecer nueva contraseña usando token
exports.resetPassword = async (req, res) => {
  try {
    const { token, nuevaContrasena, confirmarContrasena } = req.body;

    // 1. Validación de campos requeridos
    if (!token || !nuevaContrasena || !confirmarContrasena) {
      return ApiResponse.validation(
        "Token, nueva contraseña y confirmación son requeridos.",
        null,
        res
      );
    }

    // 2. Validación: contraseñas iguales
    if (nuevaContrasena !== confirmarContrasena) {
      return ApiResponse.validation(
        "Las contraseñas no coinciden.",
        null,
        res
      );
    }

    // 3. Buscar persona por token
    const persona = await PersonaRepository.findByResetToken(token);
    if (!persona) {
      return ApiResponse.validation("Token inválido o ya utilizado.", null, res);
    }

    // 4. Verificar expiración
    if (!persona.reset_token_expires || persona.reset_token_expires < new Date()) {
      return ApiResponse.validation(
        "El token ha expirado. Solicita una nueva recuperación.",
        null,
        res
      );
    }

    // 5. Hashear nueva contraseña
    const hashedPassword = await AuthUtils.hashPassword(nuevaContrasena);

    // 6. Actualizar contraseña y limpiar token
    await PersonaRepository.resetPassword(persona.id, hashedPassword);

    return ApiResponse.success(
      "Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.",
      null,
      res
    );

  } catch (error) {
    console.error("Error en POST /auth/reset-password:", error);
    return ApiResponse.error("Error al restablecer la contraseña.", res);
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