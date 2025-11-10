const MascotaRepository = require("../repositories/MascotaRepository");
const VacunaxMascotaRepository = require("../repositories/VacunaxMascotaRepository");
const ConsultaRepository = require("../repositories/ConsultaRepository");
const CirugiaRepository = require("../repositories/CirugiaRepository");
const ServiciosRepository = require("../repositories/ServiciosRepository");
const { Expediente, Mascota } = require("../models");

class ExpedienteMascotaController {
  async obtenerExpedientePorMascota(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la mascota exista
      const mascota = await Mascota.findByPk(id, {
        attributes: [
          "id",
          "id_cliente",
          "nombre",
          "especie",
          "raza",
          "color",
          "fecha_nacimiento",
          "peso",
          "URL_imagen",
        ],
      });

      if (!mascota) {
        return res.status(404).json({ message: "Mascota no encontrada" });
      }

      // Obtener expediente general
      const expediente = await Expediente.findOne({
        where: { id_mascota: id },
      });

      // Vacunas aplicadas
      const vacunas = await VacunaxMascotaRepository.getByMascotaId(id);
      const vacunasData = vacunas.map((v) => ({
        nombre: v.vacuna?.nombre,
        fecha_aplicacion: v.fecha_aplicacion,
      }));

      // Consultas médicas
      const consultas =
        (await ConsultaRepository.obtenerPorMascota?.(id)) || [];
      // Si tu repositorio no tiene este método, puedes filtrarlas manualmente por mascota
      const consultasData = consultas.map((c) => ({
        fecha_consulta: c.fecha_consulta,
        motivo: c.cita?.motivo,
        diagnostico: c.diagnostico,
        tratamiento_sugerido: c.tratamiento_sugerido,
        veterinario: c.cita?.veterinario?.persona?.nombre || "Desconocido",
      }));

      // Cirugías
      const cirugias = await CirugiaRepository.obtenerPorMascota(id);
      const cirugiasData = cirugias.map((c) => ({
        fecha_hora: c.fecha_hora,
        tipo_cirugia: c.tipo_cirugia,
        veterinario: c.veterinario?.persona?.nombre || "No asignado",
        estado: c.estado,
      }));

      // Servicios aplicados
      const servicios = await ServiciosRepository.findByMascota(id);
      const serviciosData = servicios.map((s) => ({
        tipo_servicio: s.tipo_servicio?.nombre,
        fecha_hora_solicitada: s.fecha_hora_solicitada,
        estado: s.estado,
      }));

      // Estructurar respuesta final limpia
      const respuesta = {
        mascota,
        expediente: expediente
          ? {
              alergias: expediente.alergias,
              antecedentes_patologicos: expediente.antecedentes_patologicos,
              observaciones_generales: expediente.observaciones_generales,
            }
          : null,
        vacunas: vacunasData,
        consultas: consultasData,
        cirugias: cirugiasData,
        servicios: serviciosData,
      };

      return res.status(200).json(respuesta);
    } catch (error) {
      console.error("Error al obtener expediente médico:", error);
      res
        .status(500)
        .json({ message: "Error al obtener expediente médico", error });
    }
  }
}

module.exports = new ExpedienteMascotaController();
