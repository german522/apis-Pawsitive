const { PersonaRepository } = require('../repositories');
const AuthUtils = require('../utils/auth');
const ApiResponse = require('../utils/ApiResponse');
const VerificationUtils = require('../utils/verification');
const { enviarCodigoVerificacion } = require('../utils/emailService');

// Importamos el mismo mapa
const { pendingVerifications } = require('./ClienteController');
const { VeterinarioRepository, ClienteRepository } = require('../repositories');
const { sequelize } = require('../models');
const { ValidationError, DatabaseError } = require('sequelize');

// Registro de veterinario (sin guardar en BD aún)
exports.register = async (req, res) => {
  try {
    const { 
      nombre, 
      apellido_paterno, 
      apellido_materno, 
      telefono, 
      correo, 
      contrasena,
      URL_imagen,
      cedula,
      especialidad
    } = req.body;

    if (!nombre || !apellido_paterno || !correo || !contrasena || !cedula) {
      return ApiResponse.validation("Faltan campos obligatorios: nombre, apellido_paterno, correo, contrasena, cedula.", null, res);
    }

    const existingPersona = await PersonaRepository.getByCorreo(correo);
    if (existingPersona) {
      return ApiResponse.conflict("El correo electrónico ya está registrado.", res);
    }

    const hashedPassword = await AuthUtils.hashPassword(contrasena);
    const codigoVerificacion = VerificationUtils.generateCode();
    const codigoExpiracion = VerificationUtils.generateExpirationDate();

    // Guardar temporalmente
    pendingVerifications.set(correo, {
      tipo: 'veterinario',
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      correo: correo.toLowerCase().trim(),
      contrasena: hashedPassword,
      URL_imagen,
      cedula,
      especialidad,
      codigoVerificacion,
      codigoExpiracion
    });

    await enviarCodigoVerificacion(correo, codigoVerificacion);

    return ApiResponse.success(
      "Código de verificación enviado. Valídalo para completar tu registro.",
      { correo },
      res
    );

  } catch (error) {
    console.error("Error en POST /veterinarios/register:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Logout de veterinario
exports.logout = async (req, res) => {
  try {
    return ApiResponse.success("Logout exitoso. Token debe ser eliminado del cliente.", null, res);
  } catch (error) {
    console.error("Error en POST /veterinarios/logout:", error);
    return ApiResponse.error("Error en logout.", res);
  }
};

// Eliminar cuenta de veterinario
exports.deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const veterinarioId = req.user.tipoId; // ID del veterinario desde el token
    const personaId = req.user.id; // ID de la persona desde el token

    // Verificar que el veterinario existe
    const veterinario = await VeterinarioRepository.getById(veterinarioId);
    if (!veterinario) {
      await transaction.rollback();
      return ApiResponse.notFound("Veterinario no encontrado.", res);
    }

    // Eliminar veterinario
    await VeterinarioRepository.deleteVeterinario(veterinarioId, transaction);
    
    // Eliminar persona
    await PersonaRepository.deletePersona(personaId, transaction);

    await transaction.commit();

    return ApiResponse.success("Cuenta eliminada exitosamente.", null, res);

  } catch (error) {
    await transaction.rollback();
    console.error("Error en DELETE /veterinarios/account:", error);
    
    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener perfil del veterinario
exports.getProfile = async (req, res) => {
  try {
    const veterinarioId = req.user.tipoId;
    
    const veterinario = await VeterinarioRepository.getById(veterinarioId);
    if (!veterinario) {
      return ApiResponse.notFound("Veterinario no encontrado.", res);
    }

    return ApiResponse.success("Perfil obtenido exitosamente.", { veterinario }, res);

  } catch (error) {
    console.error("Error en GET /veterinarios/profile:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Actualizar perfil del veterinario
exports.updateProfile = async (req, res) => {
  try {
    const personaId = req.user.id;
    const veterinarioId = req.user.tipoId;
    const { nombre, apellido_paterno, apellido_materno, telefono, URL_imagen, especialidad } = req.body;

    if (!nombre && !apellido_paterno && !apellido_materno && !telefono && !URL_imagen && !especialidad) {
      return ApiResponse.validation("Debe proporcionar al menos un campo para actualizar.", null, res);
    }

    // Actualizar datos de persona
    const personaData = {
      ...(nombre && { nombre: nombre.trim() }),
      ...(apellido_paterno && { apellido_paterno: apellido_paterno.trim() }),
      ...(apellido_materno !== undefined && { apellido_materno: apellido_materno?.trim() || null }),
      ...(telefono !== undefined && { telefono: telefono?.trim() || null }),
      ...(URL_imagen !== undefined && { URL_imagen: URL_imagen?.trim() || null })
    };

    if (Object.keys(personaData).length > 0) {
      await PersonaRepository.update(personaId, personaData);
    }

    // Actualizar datos específicos del veterinario
    if (especialidad !== undefined) {
      const veterinarioData = {
        especialidad: especialidad?.trim() || null
      };
      await VeterinarioRepository.update(veterinarioId, veterinarioData);
    }

    // Obtener datos actualizados
    const updatedVeterinario = await VeterinarioRepository.getById(veterinarioId);

    return ApiResponse.success("Perfil actualizado exitosamente.", { veterinario: updatedVeterinario }, res);

  } catch (error) {
    console.error("Error en PUT /veterinarios/profile:", error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Ver todos los clientes (función específica para veterinarios)
exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await ClienteRepository.getAll();
    return ApiResponse.success("Clientes obtenidos exitosamente.", { clientes }, res);

  } catch (error) {
    console.error("Error en GET /veterinarios/clientes:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Ver cliente específico por ID (función específica para veterinarios)
exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cliente = await ClienteRepository.getById(id);
    if (!cliente) {
      return ApiResponse.notFound("Cliente no encontrado.", res);
    }

    return ApiResponse.success("Cliente obtenido exitosamente.", { cliente }, res);

  } catch (error) {
    console.error("Error en GET /veterinarios/clientes/:id:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Ver clientes con mascotas (función específica para veterinarios)
exports.getClientesConMascotas = async (req, res) => {
  try {
    const clientes = await ClienteRepository.getClientesConMascotas();
    return ApiResponse.success("Clientes con mascotas obtenidos exitosamente.", { clientes }, res);

  } catch (error) {
    console.error("Error en GET /veterinarios/clientes-con-mascotas:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

exports.getAll = async (req, res) => {
  try {
    const veterinarios = await VeterinarioRepository.getAll();
    return ApiResponse.success("Veterinarios obtenidos exitosamente.", { veterinarios }, res);

  } catch (error) {
    console.error("Error en GET /veterinarios:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener veterinario por ID (para perfiles públicos)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const veterinario = await VeterinarioRepository.getById(id);
    if (!veterinario) {
      return ApiResponse.notFound("Veterinario no encontrado.", res);
    }

    return ApiResponse.success("Veterinario obtenido exitosamente.", { veterinario }, res);

  } catch (error) {
    console.error("Error en GET /veterinarios/:id:", error);
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
    console.error("Error al subir imagen:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};