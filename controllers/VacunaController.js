const { VacunaRepository } = require('../repositories');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');

// Obtener todas las vacunas
exports.getAll = async (req, res) => {
  try {
    const vacunas = await VacunaRepository.getAll();
    return ApiResponse.success("Vacunas obtenidas exitosamente.", { vacunas }, res);
  } catch (error) {
    console.error("Error en GET /vacunas:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener vacuna por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vacuna = await VacunaRepository.getById(id);
    if (!vacuna) {
      return ApiResponse.notFound("Vacuna no encontrada.", res);
    }

    return ApiResponse.success("Vacuna obtenida exitosamente.", { vacuna }, res);

  } catch (error) {
    console.error("Error en GET /vacunas/:id:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Crear nueva vacuna (solo veterinarios)
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return ApiResponse.validation("El nombre de la vacuna es obligatorio.", null, res);
    }

    // Verificar si ya existe una vacuna con ese nombre
    const existingVacuna = await VacunaRepository.getByNombre(nombre);
    if (existingVacuna) {
      return ApiResponse.conflict("Ya existe una vacuna con ese nombre.", res);
    }

    const vacunaData = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null
    };

    const vacuna = await VacunaRepository.create(vacunaData);
    return ApiResponse.success("Vacuna creada exitosamente.", { vacuna }, res, 201);

  } catch (error) {
    console.error("Error en POST /vacunas:", error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Actualizar vacuna (solo veterinarios)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre && !descripcion) {
      return ApiResponse.validation("Debe proporcionar al menos un campo para actualizar.", null, res);
    }

    // Verificar que la vacuna existe
    const existingVacuna = await VacunaRepository.getById(id);
    if (!existingVacuna) {
      return ApiResponse.notFound("Vacuna no encontrada.", res);
    }

    // Si se va a cambiar el nombre, verificar que no exista otro con ese nombre
    if (nombre && nombre !== existingVacuna.nombre) {
      const duplicateVacuna = await VacunaRepository.getByNombre(nombre);
      if (duplicateVacuna) {
        return ApiResponse.conflict("Ya existe una vacuna con ese nombre.", res);
      }
    }

    const updatedData = {
      ...(nombre && { nombre: nombre.trim() }),
      ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null })
    };

    const updatedVacuna = await VacunaRepository.update(id, updatedData);
    return ApiResponse.success("Vacuna actualizada exitosamente.", { vacuna: updatedVacuna }, res);

  } catch (error) {
    console.error("Error en PUT /vacunas/:id:", error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Eliminar vacuna (solo veterinarios)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la vacuna existe
    const existingVacuna = await VacunaRepository.getById(id);
    if (!existingVacuna) {
      return ApiResponse.notFound("Vacuna no encontrada.", res);
    }

    await VacunaRepository.deleteVacuna(id);
    return ApiResponse.success("Vacuna eliminada exitosamente.", null, res);

  } catch (error) {
    console.error("Error en DELETE /vacunas/:id:", error);
    
    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener vacuna por nombre
exports.getByNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    
    const vacuna = await VacunaRepository.getByNombre(nombre);
    if (!vacuna) {
      return ApiResponse.notFound("Vacuna no encontrada.", res);
    }

    return ApiResponse.success("Vacuna obtenida exitosamente.", { vacuna }, res);

  } catch (error) {
    console.error("Error en GET /vacunas/nombre/:nombre:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener mascotas que han recibido una vacuna específica
exports.getMascotasVacunadas = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la vacuna existe
    const vacuna = await VacunaRepository.getById(id);
    if (!vacuna) {
      return ApiResponse.notFound("Vacuna no encontrada.", res);
    }

    const mascotas = await VacunaRepository.getMascotasVacunadas(id);
    return ApiResponse.success("Mascotas vacunadas obtenidas exitosamente.", { mascotas }, res);

  } catch (error) {
    console.error("Error en GET /vacunas/:id/mascotas:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};