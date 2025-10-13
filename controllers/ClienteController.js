const { PersonaRepository } = require('../repositories');
const AuthUtils = require('../utils/auth');
const ApiResponse = require('../utils/ApiResponse');
const VerificationUtils = require('../utils/verification');
const { enviarCodigoVerificacion } = require('../utils/emailService');

// Mapa temporal en memoria
const pendingVerifications = new Map();

// Registro de cliente (sin guardar en BD aún)
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
      return ApiResponse.validation("Faltan campos obligatorios: nombre, apellido_paterno, correo, contrasena.", null, res);
    }

    const existingPersona = await PersonaRepository.getByCorreo(correo);
    if (existingPersona) {
      return ApiResponse.conflict("El correo electrónico ya está registrado.", res);
    }

    // Hashear contraseña y generar código
    const hashedPassword = await AuthUtils.hashPassword(contrasena);
    const codigoVerificacion = VerificationUtils.generateCode();
    const codigoExpiracion = VerificationUtils.generateExpirationDate();

    // Guardar temporalmente
    pendingVerifications.set(correo, {
      tipo: 'cliente',
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      correo: correo.toLowerCase().trim(),
      contrasena: hashedPassword,
      URL_imagen,
      codigoVerificacion,
      codigoExpiracion
    });

    // Enviar correo
    await enviarCodigoVerificacion(correo, codigoVerificacion);

    return ApiResponse.success(
      "Código de verificación enviado. Valídalo para completar tu registro.",
      { correo },
      res
    );

  } catch (error) {
    console.error("Error en POST /clientes/register:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Exportamos el mapa para usarlo también en verify-code
exports.pendingVerifications = pendingVerifications;


// Logout de cliente
exports.logout = async (req, res) => {
  try {
    return ApiResponse.success("Logout exitoso. Token debe ser eliminado del cliente.", null, res);
  } catch (error) {
    console.error("Error en POST /clientes/logout:", error);
    return ApiResponse.error("Error en logout.", res);
  }
};

// Eliminar cuenta de cliente
exports.deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const clienteId = req.user.tipoId; // ID del cliente desde el token
    const personaId = req.user.id; // ID de la persona desde el token

    // Verificar que el cliente existe
    const cliente = await ClienteRepository.getById(clienteId);
    if (!cliente) {
      await transaction.rollback();
      return ApiResponse.notFound("Cliente no encontrado.", res);
    }

    // Eliminar cliente (esto eliminará las mascotas por CASCADE)
    await ClienteRepository.deleteCliente(clienteId, transaction);
    
    // Eliminar persona
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

// Obtener perfil del cliente
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

// Actualizar perfil del cliente
exports.updateProfile = async (req, res) => {
  try {
    const personaId = req.user.id;
    const { nombre, apellido_paterno, apellido_materno, telefono, URL_imagen } = req.body;

    if (!nombre && !apellido_paterno && !apellido_materno && !telefono && !URL_imagen) {
      return ApiResponse.validation("Debe proporcionar al menos un campo para actualizar.", null, res);
    }

    const updatedData = {
      ...(nombre && { nombre: nombre.trim() }),
      ...(apellido_paterno && { apellido_paterno: apellido_paterno.trim() }),
      ...(apellido_materno !== undefined && { apellido_materno: apellido_materno?.trim() || null }),
      ...(telefono !== undefined && { telefono: telefono?.trim() || null }),
      ...(URL_imagen !== undefined && { URL_imagen: URL_imagen?.trim() || null })
    };

    const updatedPersona = await PersonaRepository.update(personaId, updatedData);
    if (!updatedPersona) {
      return ApiResponse.notFound("Cliente no encontrado.", res);
    }

    return ApiResponse.success("Perfil actualizado exitosamente.", { persona: updatedPersona }, res);

  } catch (error) {
    console.error("Error en PUT /clientes/profile:", error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};