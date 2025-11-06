const { VacunaxMascotaRepository, MascotaRepository, VacunaRepository } = require('../repositories');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');

// 1️⃣ Añadir vacuna a una mascota (solo veterinarios)
exports.aplicarVacuna = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    const { id_vacuna, fecha_aplicacion } = req.body;

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

// 2️⃣ Actualizar vacuna aplicada (solo veterinarios)
exports.updateVacunaMascota = async (req, res) => {
  try {
    const { id_mascota, id_vacunacion } = req.params;
    const { id_vacuna, fecha_aplicacion } = req.body;

    // Validación de datos
    if (!id_vacuna && !fecha_aplicacion) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar al menos un campo para actualizar (id_vacuna o fecha_aplicacion)."
      });
    }

    // Buscar el registro
    const registro = await VacunaxMascotaRepository.getById(id_vacunacion);
    if (!registro) {
      return res.status(404).json({
        success: false,
        message: "Registro de vacunación no encontrado."
      });
    }

    // Verificar que pertenece a la mascota
    if (registro.id_mascota != id_mascota) {
      return res.status(403).json({
        success: false,
        message: "La vacunación no pertenece a esta mascota."
      });
    }

    // Crear objeto de actualización dinámico
    const updatedData = {};
    if (id_vacuna) updatedData.id_vacuna = id_vacuna;
    if (fecha_aplicacion) updatedData.fecha_aplicacion = fecha_aplicacion;

    // Actualizar
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


// 3️⃣ Eliminar vacuna aplicada (solo veterinarios)
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

// 4️⃣ Obtener todas las vacunas aplicadas de una mascota (usuarios y veterinarios)
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

// 5️⃣ Obtener detalle de una vacuna aplicada (usuarios y veterinarios)
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