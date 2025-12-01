const { PersonaRepository, ClienteRepository } = require('../repositories');
const { sequelize } = require('../models');
const AuthUtils = require('../utils/auth');
const ApiResponse = require('../utils/ApiResponse');
const VerificationUtils = require('../utils/verification');
const { enviarCorreoVerificacion } = require('../utils/emailService');
const { ValidationError, DatabaseError } = require('sequelize');

// Mapa temporal en memoria
const pendingVerifications = new Map();

const RESEND_COOLDOWN_MS = 60 * 1000; // 60s

exports.register = async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      correo,
      contrasena,
      URL_imagen
    } = req.body;

    if (!nombre || !apellido_paterno || !correo || !contrasena) {
      return ApiResponse.validation(
        "Faltan campos obligatorios: nombre, apellido_paterno, correo, contrasena.",
        null,
        res
      );
    }

    // Normalizar correo
    const email = String(correo).toLowerCase().trim();

    // ¿Ya existe?
    const existingPersona = await PersonaRepository.getByCorreo(email);
    if (existingPersona) {
      return ApiResponse.conflict("El correo electrónico ya está registrado.", res);
    }

    // Verificar cooldown si ya hay un pending
    const existingPending = pendingVerifications.get(email);
    const now = Date.now();
    if (existingPending?.lastSentAt && (now - existingPending.lastSentAt) < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existingPending.lastSentAt)) / 1000);
      return ApiResponse.tooManyRequests(
        `Espera ${wait}s para solicitar un nuevo código.`,
        res
      );
    }

    // Hash de contraseña + generación de código/expiración
    const hashedPassword = await AuthUtils.hashPassword(contrasena);
    const codigoVerificacion = VerificationUtils.generateCode();        // ej. 6 dígitos
    const codigoExpiracion = VerificationUtils.generateExpirationDate(); // ej. now + 15 min

    // Guardar temporalmente (en memoria) los datos del registro
    pendingVerifications.set(email, {
      tipo: 'cliente',
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      correo: email,
      contrasena: hashedPassword,
      URL_imagen,
      codigoHash: null,          // si luego decides hashear el código
      codigoPlano: codigoVerificacion, // si mantienes plano temporalmente
      codigoExpiracion,
      attempts: 0,
      lastSentAt: now
    });

    // Enviar correo de verificación (Resend, API HTTP)
    await enviarCorreoVerificacion({
      to: email,
      code: codigoVerificacion,
      idempotencyKey: `register:${email}:${new Date().toISOString()}`
    });

    return ApiResponse.success(
      "Código de verificación enviado. Valídalo para completar tu registro.",
      { correo: email },
      res
    );

  } catch (error) {
    console.error("Error en POST /clientes/register:", error);
    // Limpia el pending si falló el envío para no dejar estados colgados
    if (req?.body?.correo) {
      const email = String(req.body.correo).toLowerCase().trim();
      const p = pendingVerifications.get(email);
      if (p && !p.emailVerificado) pendingVerifications.delete(email);
    }
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Export del mapa (si lo manejas aquí)
exports.pendingVerifications = pendingVerifications;

// =========================
// Logout
// =========================
exports.logout = async (req, res) => {
  try {
    return ApiResponse.success("Logout exitoso. Token debe ser eliminado del cliente.", null, res);
  } catch (error) {
    console.error("Error en POST /clientes/logout:", error);
    return ApiResponse.error("Error en logout.", res);
  }
};

// =========================
// Eliminar cuenta
// =========================
exports.deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const clienteId = req.user.tipoId;
    const personaId = req.user.id;

    const cliente = await ClienteRepository.getById(clienteId);
    if (!cliente) {
      await transaction.rollback();
      return ApiResponse.notFound("Cliente no encontrado.", res);
    }

    await ClienteRepository.deleteCliente(clienteId, transaction);
    await PersonaRepository.deletePersona(personaId, transaction);

    await transaction.commit();

    return ApiResponse.success("Cuenta eliminada exitosamente.", null, res);
  } catch (error) {
    await transaction.rollback();
    console.error("Error en DELETE /clientes/account:", error);

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// =========================
// Obtener perfil
// =========================
exports.getProfile = async (req, res) => {
  try {
    const clienteId = req.user.tipoId;
    const cliente = await ClienteRepository.getById(clienteId);
    if (!cliente) {
      return ApiResponse.notFound("Cliente no encontrado.", res);
    }
    return ApiResponse.success("Perfil obtenido exitosamente.", { cliente }, res);
  } catch (error) {
    console.error("Error en GET /clientes/profile:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// =========================
// Actualizar perfil
// =========================
exports.updateProfile = async (req, res) => {
  try {
    const personaId = req.user.tipoId;

    // Solo permitimos actualizar estos campos
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      URL_imagen,
      correo,
      password
    } = req.body;

    // Si alguien intenta mandar correo o password, lo bloqueamos
    if (correo !== undefined || password !== undefined) {
      return ApiResponse.validation(
        "No se puede actualizar correo ni contraseña desde este endpoint.",
        null,
        res
      );
    }

    // Validar que al menos venga UN campo permitido (aunque luego validemos su contenido)
    if (
      nombre === undefined &&
      apellido_paterno === undefined &&
      apellido_materno === undefined &&
      telefono === undefined &&
      URL_imagen === undefined
    ) {
      return ApiResponse.validation(
        "Debe proporcionar al menos un campo para actualizar.",
        null,
        res
      );
    }

    const updatedData = {};

    // Helper para validar campos de texto obligatorios (no vacíos)
    const validarTextoObligatorio = (valor, nombreCampoLegible) => {
      const texto = String(valor).trim();
      if (!texto) {
        throw new ValidationError([
          { message: `El campo ${nombreCampoLegible} no puede estar vacío.` }
        ]);
      }
      return texto;
    };

    try {
      if (nombre !== undefined) {
        updatedData.nombre = validarTextoObligatorio(nombre, "nombre");
      }

      if (apellido_paterno !== undefined) {
        updatedData.apellido_paterno = validarTextoObligatorio(apellido_paterno, "apellido paterno");
      }

      if (apellido_materno !== undefined) {
        updatedData.apellido_materno = validarTextoObligatorio(apellido_materno, "apellido materno");
      }

      if (telefono !== undefined) {
        updatedData.telefono = validarTextoObligatorio(telefono, "teléfono");
      }

      if (URL_imagen !== undefined) {
        updatedData.URL_imagen = validarTextoObligatorio(URL_imagen, "URL de imagen");
      }

    } catch (errorValidacionCampos) {
      // Si lanzamos nuestro ValidationError manual, lo atrapamos aquí
      if (errorValidacionCampos instanceof ValidationError) {
        return ApiResponse.validation(
          errorValidacionCampos.errors.map(e => e.message),
          null,
          res
        );
      }
      throw errorValidacionCampos;
    }

    const updatedPersona = await PersonaRepository.update(personaId, updatedData);
    if (!updatedPersona) {
      return ApiResponse.notFound("Perfil no encontrado.", res);
    }

    return ApiResponse.success(
      "Perfil actualizado exitosamente.",
      { persona: updatedPersona },
      res
    );

  } catch (error) {
    console.error("Error en PUT /auth/update-profile:", error);

    if (error instanceof ValidationError) {
      return ApiResponse.validation(
        error.errors.map(e => e.message),
        null,
        res
      );
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

exports.subirImagen = async (req, res) => {
  try {
    const file = req.file;
    const personaId = req.user.id;

    if (!file) {
      return ApiResponse.validation('No se ha proporcionado una imagen.', null, res);
    }

    // file.path contiene la URL de Cloudinary
    const resultado = await PersonaRepository.subirImagenPersona(personaId, file.path);

    return ApiResponse.success('Imagen subida correctamente.', { url: resultado.url }, res);

  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};
