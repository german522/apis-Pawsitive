const { Mascota, Expediente } = require("../models");
const VacunaxMascotaRepository = require("./VacunaxMascotaRepository");
const ConsultaRepository = require("./ConsultaRepository");
const CirugiaRepository = require("./CirugiaRepository");
const ServiciosRepository = require("./serviciosRepository");

class HistorialClinicoRepository {
  async obtenerExpedienteCompleto(idMascota) {
    const mascota = await Mascota.findByPk(idMascota, {
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

    if (!mascota) return null;

    const expediente = await Expediente.findOne({ where: { id_mascota: idMascota } });

    const vacunas = await VacunaxMascotaRepository.getByMascotaId(idMascota);
    const vacunasData = vacunas.map(v => ({
      nombre: v.vacuna?.nombre,
      fecha_aplicacion: v.fecha_aplicacion,
    }));

    const consultas = (await ConsultaRepository.obtenerPorMascota?.(idMascota)) || [];
    const consultasData = consultas.map(c => ({
      fecha_consulta: c.fecha_consulta,
      motivo: c.cita?.motivo,
      diagnostico: c.diagnostico,
      tratamiento_sugerido: c.tratamiento_sugerido,
      veterinario: c.cita?.veterinario?.persona?.nombre || "Desconocido",
    }));

    const cirugias = await CirugiaRepository.obtenerPorMascota(idMascota);
    const cirugiasData = cirugias.map(c => ({
      fecha_hora: c.fecha_hora,
      tipo_cirugia: c.tipo_cirugia,
      veterinario: c.veterinario?.persona?.nombre || "No asignado",
      estado: c.estado,
    }));

    const servicios = await ServiciosRepository.getByMascota(idMascota);
    const serviciosData = servicios.map(s => ({
      tipo_servicio: s.tipo_servicio?.nombre,
      fecha_hora_solicitada: s.fecha_hora_solicitada,
      estado: s.estado,
    }));

    return {
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
  }
}

module.exports = new HistorialClinicoRepository();
