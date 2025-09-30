const { VacunaxMascotaRepository, MascotaRepository, VacunaRepository } = require('../repositories');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');

// Obtener todos los registros de vacunación
exports.getAll = async (req, res) => {
  try {
    const vacunaciones = await VacunaxMascotaRepository.getAll();
    return ApiResponse.success("Registros de vacunación obtenidos exitosamente.", { vacunaciones }, res);
  } catch (error) {
    console.error("Error en GET /vacunaciones:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener registro de vacunación por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vacunacion = await VacunaxMascotaRepository.getById(id);
    if (!vacunacion) {
      return ApiResponse.notFound("Registro de vacunación no encontrado.", res);
    }

    return ApiResponse.success("Registro de vacunación obtenido exitosamente.", { vacunacion }, res);

  } catch (error) {
    console.error("Error en GET /vacunaciones/:id:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Aplicar vacuna a mascota (crear nuevo registro)
exports.aplicarVacuna = async (req, res) => {
  try {
    const { id_mascota, id_vacuna, fecha_aplicacion } = req.body;

    // Validaciones básicas
    if (!id_mascota || !id_vacuna) {
      return ApiResponse.validation("Los campos id_mascota e id_vacuna son obligatorios.", null, res);
    }

    // Verificar que la mascota existe
    const mascota = await MascotaRepository.getById(id_mascota);
    if (!mascota) {
      return ApiResponse.notFound("Mascota no encontrada.", res);
    }

    // Verificar que la vacuna existe
    const vacuna = await VacunaRepository.getById(id_vacuna);
    if (!vacuna) {
      return ApiResponse.notFound("Vacuna no encontrada.", res);
    }

    // Verificar permisos: los clientes solo pueden aplicar vacunas a sus mascotas
    if (req.user.tipo === 'cliente' && mascota.id_cliente !== req.user.tipoId) {
      return ApiResponse.forbidden("No tienes permiso para aplicar vacunas a esta mascota.", res);
    }

    const vacunacionData = {
      id_mascota,
      id_vacuna,
      fecha_aplicacion: fecha_aplicacion || new Date()
    };

    const vacunacion = await VacunaxMascotaRepository.create(vacunacionData);
    return ApiResponse.success("Vacuna aplicada exitosamente.", { vacunacion }, res, 201);

  } catch (error) {
    console.error("Error en POST /vacunaciones:", error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Actualizar registro de vacunación
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_aplicacion } = req.body;

    if (!fecha_aplicacion) {
      return ApiResponse.validation("Debe proporcionar la fecha de aplicación para actualizar.", null, res);
    }

    // Verificar que el registro existe
    const existingVacunacion = await VacunaxMascotaRepository.getById(id);
    if (!existingVacunacion) {
      return ApiResponse.notFound("Registro de vacunación no encontrado.", res);
    }

    // Verificar permisos: los clientes solo pueden actualizar registros de sus mascotas
    if (req.user.tipo === 'cliente') {
      const mascota = await MascotaRepository.getById(existingVacunacion.id_mascota);
      if (mascota && mascota.id_cliente !== req.user.tipoId) {
        return ApiResponse.forbidden("No tienes permiso para actualizar este registro.", res);
      }
    }

    const updatedData = {
      fecha_aplicacion
    };

    const updatedVacunacion = await VacunaxMascotaRepository.update(id, updatedData);
    return ApiResponse.success("Registro de vacunación actualizado exitosamente.", { vacunacion: updatedVacunacion }, res);

  } catch (error) {
    console.error("Error en PUT /vacunaciones/:id:", error);
    
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Eliminar registro de vacunación
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el registro existe
    const existingVacunacion = await VacunaxMascotaRepository.getById(id);
    if (!existingVacunacion) {
      return ApiResponse.notFound("Registro de vacunación no encontrado.", res);
    }

    // Verificar permisos: los clientes solo pueden eliminar registros de sus mascotas
    if (req.user.tipo === 'cliente') {
      const mascota = await MascotaRepository.getById(existingVacunacion.id_mascota);
      if (mascota && mascota.id_cliente !== req.user.tipoId) {
        return ApiResponse.forbidden("No tienes permiso para eliminar este registro.", res);
      }
    }

    await VacunaxMascotaRepository.deleteVacunaxMascota(id);
    return ApiResponse.success("Registro de vacunación eliminado exitosamente.", null, res);

  } catch (error) {
    console.error("Error en DELETE /vacunaciones/:id:", error);
    
    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener historial de vacunación por mascota
exports.getByMascotaId = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    
    // Verificar que la mascota existe
    const mascota = await MascotaRepository.getById(id_mascota);
    if (!mascota) {
      return ApiResponse.notFound("Mascota no encontrada.", res);
    }

    // Verificar permisos: los clientes solo pueden ver registros de sus mascotas
    if (req.user.tipo === 'cliente' && mascota.id_cliente !== req.user.tipoId) {
      return ApiResponse.forbidden("No tienes permiso para ver el historial de esta mascota.", res);
    }

    const historial = await VacunaxMascotaRepository.getByMascotaId(id_mascota);
    return ApiResponse.success("Historial de vacunación obtenido exitosamente.", { historial }, res);

  } catch (error) {
    console.error("Error en GET /vacunaciones/mascota/:id_mascota:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener registros por vacuna
exports.getByVacunaId = async (req, res) => {
  try {
    const { id_vacuna } = req.params;
    
    // Verificar que la vacuna existe
    const vacuna = await VacunaRepository.getById(id_vacuna);
    if (!vacuna) {
      return ApiResponse.notFound("Vacuna no encontrada.", res);
    }

    const registros = await VacunaxMascotaRepository.getByVacunaId(id_vacuna);
    return ApiResponse.success("Registros de vacunación obtenidos exitosamente.", { registros }, res);

  } catch (error) {
    console.error("Error en GET /vacunaciones/vacuna/:id_vacuna:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener historial completo de una mascota (ordenado cronológicamente)
exports.getHistorialCompleto = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    
    // Verificar que la mascota existe
    const mascota = await MascotaRepository.getById(id_mascota);
    if (!mascota) {
      return ApiResponse.notFound("Mascota no encontrada.", res);
    }

    // Verificar permisos: los clientes solo pueden ver registros de sus mascotas
    if (req.user.tipo === 'cliente' && mascota.id_cliente !== req.user.tipoId) {
      return ApiResponse.forbidden("No tienes permiso para ver el historial de esta mascota.", res);
    }

    const historialCompleto = await VacunaxMascotaRepository.getHistorialCompleto(id_mascota);
    return ApiResponse.success("Historial completo de vacunación obtenido exitosamente.", { historial: historialCompleto }, res);

  } catch (error) {
    console.error("Error en GET /vacunaciones/mascota/:id_mascota/historial:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};