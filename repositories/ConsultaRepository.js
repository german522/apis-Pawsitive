const { Consulta, Cita, Mascota, Persona, Veterinario } = require("../models");

class ConsultaRepository {
  async crearConsulta(data) {
    return await Consulta.create(data);
  }

  async obtenerPorMascota(id_mascota) {
  return await Consulta.findAll({
    include: [
      {
        model: Cita,
        as: "cita",
        include: [
          {
            model: Mascota,
            as: "Mascotum",
            attributes: ["nombre"]
          },
          {
            model: Persona,
            as: "cliente",
            attributes: ["nombre", "correo"]
          },
          {
            model: Veterinario,
            include: [
              {
                model: Persona,
                as: "persona",
                attributes: ["nombre", "correo"],
              },
            ],
          },
        ],
      },
    ],
    where: { id_mascota }
  });
}



  async obtenerPorId(id) {
    return await Consulta.findByPk(id, {
      include: [
        {
          model: Cita,
          as: "cita",
          include: [
            { model: Mascota, attributes: ["nombre"] },
            { model: Persona, as: "cliente", attributes: ["nombre", "correo"] },
            {
              model: Veterinario,
              include: {
                model: Persona,
                as: "persona",
                attributes: ["nombre", "correo"],
              },
            },
          ],
        },
      ],
    });
  }

  async obtenerPorCita(id_cita) {
    return await Consulta.findOne({
      where: { id_cita },
      include: [{ model: Cita, as: "cita" }],
    });
  }

  async listarConsultasPorUsuario(tipo, tipoId) {
    const whereCita = {};

    if (tipo === "cliente") {
      whereCita.id_cliente = tipoId;
    } else if (tipo === "veterinario") {
      whereCita.id_veterinario = tipoId;
    }

    return await Consulta.findAll({
      include: [
        {
          model: Cita,
          as: "cita",
          where: whereCita,
          include: [
            { model: Mascota, attributes: ["nombre"] },
            { model: Persona, as: "cliente", attributes: ["nombre"] },
            {
              model: Veterinario,
              include: [
                { model: Persona, as: "persona", attributes: ["nombre"] },
              ],
            },
          ],
        },
      ],
    });
  }
}

module.exports = new ConsultaRepository();
