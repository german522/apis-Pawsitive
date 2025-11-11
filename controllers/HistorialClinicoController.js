const HistorialClinicoRepository = require("../repositories/HistorialClinicoRepository");
const ApiResponse = require("../utils/ApiResponse");

exports.obtenerExpedientePorMascota = async (req, res) => {
  try {
    const { id } = req.params;

    const expedienteCompleto = await HistorialClinicoRepository.obtenerExpedienteCompleto(id);

    if (!expedienteCompleto) {
      return ApiResponse.notFound("Mascota no encontrada.", res);
    }

    return ApiResponse.success(
      "Expediente completo de la mascota obtenido exitosamente.",
      expedienteCompleto,
      res
    );
  } catch (error) {
    console.error("Error en GET /expediente/:id:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};
