const TipoServicioRepository = require('../repositories/tiposServicioRepository');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');

// Obtener todos los tipos de servicio
exports.getAll = async (req, res) => {
  try {
    const tiposServicios = await TipoServicioRepository.getAll();
    return ApiResponse.success("Tipos de servicio obtenidos exitosamente.", { tiposServicios }, res);
  } catch (error) {
    console.error("Error en GET /tipos-servicio:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Actualizar costo de un tipo de servicio por ID
exports.updateCosto = async (req, res) => {
  try {
    const { id } = req.params;
    const { costo } = req.body;

    if (costo === undefined || costo === null || isNaN(costo)) {
      return ApiResponse.validation("Debe proporcionar un valor numérico válido para 'costo'.", null, res);
    }

    const tipoServicio = await TipoServicioRepository.getById(id);
    if (!tipoServicio) {
      return ApiResponse.notFound("Tipo de servicio no encontrado.", res);
    }

    const actualizado = await TipoServicioRepository.update(id, { costo });
    return ApiResponse.success("Costo del tipo de servicio actualizado exitosamente.", { tipoServicio: actualizado }, res);

  } catch (error) {
    console.error("Error en PUT /tipos-servicio/:id/costo:", error);

    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Eliminar tipo de servicio por ID
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const tipoServicio = await TipoServicioRepository.getById(id);
    if (!tipoServicio) {
      return ApiResponse.notFound("Tipo de servicio no encontrado.", res);
    }

    await TipoServicioRepository.delete(id);
    return ApiResponse.success("Tipo de servicio eliminado exitosamente.", null, res);

  } catch (error) {
    console.error("Error en DELETE /tipos-servicio/:id:", error);

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};
