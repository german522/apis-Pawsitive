const { VacunaxMascotaRepository, MascotaRepository, VacunaRepository } = require('../repositories');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');

exports.aplicarVacuna = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    const { id_vacuna, fecha_aplicacion } = req.body;

    // Obtener el ID del veterinario desde el JWT
    const id_veterinario = req.user?.tipoId;
    if (!id_veterinario) {
      return ApiResponse.unauthorized("No se pudo obtener la información del veterinario autenticado.", res);
    }

    if (!id_vacuna) {
      return ApiResponse.validation("El campo id_vacuna es obligatorio.", null, res);
    }

    const mascota = await MascotaRepository.getById(id_mascota);
    if (!mascota) return ApiResponse.notFound("Mascota no encontrada.", res);

    const vacuna = await VacunaRepository.getById(id_vacuna);
    if (!vacuna) return ApiResponse.notFound("Vacuna no encontrada.", res);

    const vacunacionData = {
      id_mascota,
      id_vacuna,
      id_veterinario,
      fecha_aplicacion: fecha_aplicacion || new Date()
    };

    const vacunacion = await VacunaxMascotaRepository.create(vacunacionData);
    return ApiResponse.success("Vacuna aplicada exitosamente.", { vacunacion }, res, 201);

  } catch (error) {
    console.error("Error al aplicar vacuna:", error);
    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }
    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

exports.updateVacunaMascota = async (req, res) => {
  try {
    const { id_mascota, id_vacunacion } = req.params;
    const { id_vacuna, fecha_aplicacion } = req.body;

    if (!id_vacuna && !fecha_aplicacion) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar al menos un campo para actualizar (id_vacuna o fecha_aplicacion)."
      });
    }

    const registro = await VacunaxMascotaRepository.getById(id_vacunacion);
    if (!registro) {
      return res.status(404).json({
        success: false,
        message: "Registro de vacunación no encontrado."
      });
    }

    if (registro.id_mascota != id_mascota) {
      return res.status(403).json({
        success: false,
        message: "La vacunación no pertenece a esta mascota."
      });
    }

    const updatedData = {};
    if (id_vacuna) updatedData.id_vacuna = id_vacuna;
    if (fecha_aplicacion) updatedData.fecha_aplicacion = fecha_aplicacion;

    const updated = await VacunaxMascotaRepository.update(id_vacunacion, updatedData);

    return res.status(200).json({
      success: true,
      message: "Vacunación actualizada exitosamente.",
      data: updated
    });

  } catch (error) {
    console.error("Error al actualizar vacuna:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error.message
    });
  }
};

exports.deleteVacunaMascota = async (req, res) => {
  try {
    const { id_mascota, id_vacunacion } = req.params;

    const registro = await VacunaxMascotaRepository.getById(id_vacunacion);
    if (!registro || registro.id_mascota != id_mascota) {
      return ApiResponse.notFound("Registro de vacunación no encontrado para esta mascota.", res);
    }

    await VacunaxMascotaRepository.deleteVacunaxMascota(id_vacunacion);
    return ApiResponse.success("Vacunación eliminada exitosamente.", null, res);

  } catch (error) {
    console.error("Error al eliminar vacuna:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

exports.getVacunasByMascotaId = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    const mascota = await MascotaRepository.getById(id_mascota);
    if (!mascota) return ApiResponse.notFound("Mascota no encontrada.", res);

    const vacunas = await VacunaxMascotaRepository.getByMascotaId(id_mascota);
    return ApiResponse.success("Vacunas aplicadas obtenidas exitosamente.", { vacunas }, res);

  } catch (error) {
    console.error("Error al obtener vacunas:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

exports.getDetalleVacunaMascota = async (req, res) => {
  try {
    const { id_mascota, id_vacunacion } = req.params;

    const registro = await VacunaxMascotaRepository.getById(id_vacunacion);
    if (!registro || registro.id_mascota != id_mascota) {
      return ApiResponse.notFound("Registro de vacunación no encontrado para esta mascota.", res);
    }

    const vacuna = await VacunaRepository.getById(registro.id_vacuna);
    return ApiResponse.success("Detalle de vacunación obtenido exitosamente.", { registro, vacuna }, res);

  } catch (error) {
    console.error("Error al obtener detalle de vacuna:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};