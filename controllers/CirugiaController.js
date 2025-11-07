const { Op } = require("sequelize");
const CirugiaRepository = require("../repositories/CirugiaRepository");
const ApiResponse = require("../utils/ApiResponse");

exports.registrarCirugia = async (req, res) => {
  try {
    const { id_mascota, fecha_hora, tipo_cirugia, descripcion, notas_preoperatorias, notas_postoperatorias } = req.body;

    if (!id_mascota || !fecha_hora || !tipo_cirugia || !descripcion || !notas_preoperatorias || !notas_postoperatorias) {
      return ApiResponse.validation("Por favor, rellene todos los campos antes de programar la cirugía.", null, res);
    }

    if (req.user.tipo !== "veterinario") {
      return ApiResponse.forbidden("Solo los veterinarios pueden registrar cirugías.", res);
    }

    const fechaInicio = new Date(fecha_hora);
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); 

    const cirugiaEmpalmada = await CirugiaRepository.buscarCirugiaEnRango(fechaInicio, fechaFin);

    if (cirugiaEmpalmada) {
      return ApiResponse.validation(
        "Ya existe una cirugía programada en ese horario. Debe haber al menos una hora de diferencia entre cirugías.",
        null,
        res
      );
    }

    const nuevaCirugia = await CirugiaRepository.crear({
      id_mascota,
      id_veterinario: req.user.tipoId,
      fecha_hora,
      tipo_cirugia,
      descripcion,
      notas_preoperatorias,
      notas_postoperatorias
    });

    return ApiResponse.success("Cirugía registrada correctamente.", nuevaCirugia, res, 201);
  } catch (error) {
    console.error("Error al registrar cirugía:", error);
    return ApiResponse.error("Error al registrar cirugía.", res, 500, error.message);
  }
};

exports.listarCirugiasTotales = async (req, res) => {
  try {
    if (req.user.tipo !== "veterinario") {
      return ApiResponse.forbidden("Solo los veterinarios pueden listar todas las cirugías.", res);
    }

    const cirugias = await CirugiaRepository.obtenerTodas();
    return ApiResponse.success("Listado de cirugías obtenido correctamente.", cirugias, res);
  } catch (error) {
    console.error("Error al listar cirugías:", error);
    return ApiResponse.error("Error al listar cirugías.", res, 500, error.message);
  }
};

exports.listarCirugiasPorMascota = async (req, res) => {
  try {
    const { id_mascota } = req.params;

    if (!id_mascota) {
      return ApiResponse.validation("Debe proporcionar el id de la mascota.", null, res);
    }

    const cirugias = await CirugiaRepository.obtenerPorMascota(id_mascota);

    if (!cirugias || cirugias.length === 0) {
      return ApiResponse.notFound("No se encontraron cirugías para esta mascota.", res);
    }

    return ApiResponse.success("Listado de cirugías por mascota obtenido correctamente.", cirugias, res);
  } catch (error) {
    console.error("Error al listar cirugías por mascota:", error);
    return ApiResponse.error("Error al listar cirugías por mascota.", res, 500, error.message);
  }
};

exports.actualizarEstadoCirugia = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return ApiResponse.validation("Debe proporcionar un estado válido.", null, res);
    }

    if (req.user.tipo !== "veterinario") {
      return ApiResponse.forbidden("Solo los veterinarios pueden actualizar el estado de una cirugía.", res);
    }

    const cirugiaActualizada = await CirugiaRepository.actualizarEstado(id, estado);

    if (!cirugiaActualizada) {
      return ApiResponse.notFound("Cirugía no encontrada.", res);
    }

    return ApiResponse.success("Estado de la cirugía actualizado correctamente.", cirugiaActualizada, res);
  } catch (error) {
    console.error("Error al actualizar estado de cirugía:", error);
    return ApiResponse.error("Error al actualizar estado de cirugía.", res, 500, error.message);
  }
};

exports .obtenerCirugiaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cirugia = await CirugiaRepository.obtenerPorId(id);

    if (!cirugia) {
      return ApiResponse.notFound("Cirugía no encontrada.", res);
    }
    return ApiResponse.success("Cirugía obtenida correctamente.", cirugia, res);
  } catch (error) {
    console.error("Error al obtener cirugía por ID:", error);
    return ApiResponse.error("Error al obtener cirugía por ID.", res, 500, error.message);
  }
};

exports.actualizarHorasCirugia = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_hora } = req.body;
    if (!fecha_hora) {
      return ApiResponse.validation("Debe proporcionar una nueva fecha y hora.", null, res);
    }
    if (req.user.tipo !== "veterinario") {
      return ApiResponse.forbidden("Solo los veterinarios pueden actualizar la fecha y hora de una cirugía.", res);
    }
    const cirugiaActualizada = await CirugiaRepository.actualizarHoras(id, fecha_hora);
    if (!cirugiaActualizada) {
      return ApiResponse.notFound("Cirugía no encontrada.", res);
    }
    return ApiResponse.success("Fecha y hora de la cirugía actualizadas correctamente.", cirugiaActualizada, res);
  } catch (error) {
    console.error("Error al actualizar fecha y hora de cirugía:", error);
    return ApiResponse.error("Error al actualizar fecha y hora de cirugía.", res, 500, error.message);
  }
};