const { PersonaRepository, VeterinarioRepository, ClienteRepository } = require('../repositories');
const AuthUtils = require('../utils/auth');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');
const { sequelize } = require('../models');
const VerificationUtils = require('../utils/verification');
const { enviarCodigoVerificacion } = require('../utils/emailService');

// Registro de veterinario
exports.register = async (req, res) => {
  const transaction = await sequelize.transaction();
  
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

    // Validaciones básicas
    if (!nombre || !apellido_paterno || !correo || !contrasena || !cedula) {
      await transaction.rollback();
      return ApiResponse.validation("Faltan campos obligatorios: nombre, apellido_paterno, correo, contrasena, cedula.", null, res);
    }

    // Verificar si el correo ya existe
    const existingPersona = await PersonaRepository.getByCorreo(correo.toLowerCase().trim());

    // Si ya existe y está verificado, no permitir registro duplicado
    if (existingPersona && existingPersona.verificado) {
      await transaction.rollback();
      return ApiResponse.conflict("El correo electrónico ya está registrado.", res);
    }

    // Verificar si la cédula ya existe
    const existingVeterinario = await VeterinarioRepository.getByCedula(cedula);
    if (existingVeterinario) {
      await transaction.rollback();
      return ApiResponse.conflict("La cédula profesional ya está registrada.", res);
    }

    // Hashear contraseña
    const hashedPassword = await AuthUtils.hashPassword(contrasena);

    // Generar código y expiración
    const codigo = VerificationUtils.generateCode();
    const expiracion = VerificationUtils.generateExpirationDate();

    // Si existe pero no está verificado -> reenvío de código (actualizar código y expiración)
    if (existingPersona && !existingPersona.verificado) {
      await PersonaRepository.update(existingPersona.id, {
        codigo_verificacion: codigo,
        codigo_expiracion: expiracion
      });

      // Enviar correo con el código ANTES de commitear
      try {
        await enviarCodigoVerificacion(existingPersona.correo, codigo, `${existingPersona.nombre} ${existingPersona.apellido_paterno}`);
      } catch (emailErr) {
        if (transaction && !transaction.finished) await transaction.rollback();
        console.error('❌ Error al enviar correo:', emailErr);
        return ApiResponse.error('No se pudo enviar el correo de verificación. Intenta más tarde.', res);
      }

      await transaction.commit();

      return ApiResponse.success("Correo ya registrado pero no verificado. Se ha reenviado el código de verificación.", null, res);
    }

    // Crear persona (no verificado aún)
    const personaData = {
      nombre: nombre.trim(),
      apellido_paterno: apellido_paterno.trim(),
      apellido_materno: apellido_materno?.trim() || null,
      telefono: telefono?.trim() || null,
      correo: correo.toLowerCase().trim(),
      contrasena: hashedPassword,
      URL_imagen: URL_imagen?.trim() || null,
      verificado: false,
      codigo_verificacion: codigo,
      codigo_expiracion: expiracion
    };


    // Crear veterinario asociado (existirá en BD pero la cuenta no podrá iniciar sesión hasta verificar el correo)
    const veterinarioData = {
      id_persona: persona.id,
      cedula: cedula.trim(),
      especialidad: especialidad?.trim() || null
    };

    const persona = await PersonaRepository.create(personaData);

    const veterinario = await VeterinarioRepository.create(veterinarioData);

    // Enviar correo con el código de verificación ANTES de commitear
    try {
      await enviarCodigoVerificacion(persona.correo, codigo, `${persona.nombre} ${persona.apellido_paterno}`);
    } catch (emailErr) {
      if (transaction && !transaction.finished) await transaction.rollback();
      console.error('❌ Error al enviar correo:', emailErr);
      return ApiResponse.error('No se pudo enviar el correo de verificación. Intenta más tarde.', res);
    }

    await transaction.commit();

    return ApiResponse.success("Registro pendiente. Se ha enviado un código de verificación a tu correo. Verifica para completar el registro.", null, res, 201);

  } catch (error) {
    try {
      if (transaction && !transaction.finished) await transaction.rollback();
    } catch (rbErr) {
      console.warn('No se pudo hacer rollback (ya finalizada la transacción):', rbErr);
    }
    console.error("❌ Error en POST /veterinarios/register:", error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

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