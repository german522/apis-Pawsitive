const { Cirugia, Mascota, Veterinario, Persona } = require("../models");
const { Op } = require("sequelize");

class CirugiaRepository {

  async crear(data) {
    return await Cirugia.create(data);
  }

  async buscarCirugiaEnRango(fechaInicio, fechaFin) {
  return await Cirugia.findOne({
    where: {
      fecha_hora: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    }
  });
  }

  async obtenerTodas() {
    return await Cirugia.findAll({
      include: [
        {
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre", "especie", "raza"]
        },
        {
          model: Veterinario,
          as: "veterinario",
          include: [
            { model: Persona, as: "persona", attributes: ["nombre", "apellido_paterno"] }
          ]
        }
      ],
      order: [["fecha_hora", "DESC"]]
    });
  }

  async obtenerPorMascota(id_mascota) {
    return await Cirugia.findAll({
      where: { id_mascota },
      include: [
        {
          model: Veterinario,
          as: "veterinario",
          include: [
            { model: Persona, as: "persona", attributes: ["nombre", "apellido_paterno"] }
          ]
        },
        {
          model: Mascota,
          as: "mascota",
          attributes: ["nombre"]
        }
      ],
      order: [["fecha_hora", "DESC"]]
    });
  }

  async actualizarEstado(id, nuevoEstado) {
    const cirugia = await Cirugia.findByPk(id);
    if (!cirugia) return null;
    return await cirugia.update({ estado: nuevoEstado });
  }

  async actualizarHoras(id, nuevasHoras) {
    const cirugia = await Cirugia.findByPk(id);
    if (!cirugia) return null;
    return await cirugia.update({ fecha_hora: nuevasHoras });
  }
  
  async obtenerPorId(id) {
    return await Cirugia.findByPk(id, {
      include: [
        {
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre"]
        },
        {
          model: Veterinario,
          as: "veterinario",
          include: [{ model: Persona, as: "persona", attributes: ["nombre", "apellido_paterno"] }]
        }
      ]
    });
  }
}

module.exports = new CirugiaRepository();
