const db = require("../models");
const { Servicios, Consulta, VacunaxMascota, Cliente, Veterinario, TiposServicio, sequelize, Sequelize } = db;
const { Op } = Sequelize;

class EstadisticasRepository {

  async contarClientes() {
    return await Cliente.count();
  }

  async contarVeterinarios() {
    return await Veterinario.count();
  }

  async getServiciosPorSemana() {
    return await Servicios.findAll({
      attributes: [
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad"]
      ],
      group: ["semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")), "ASC"]]
    });
  }

  async getConsultasPorSemana() {
    return await Consulta.findAll({
      attributes: [
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_consulta")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad"]
      ],
      group: ["semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_consulta")), "ASC"]]
    });
  }

  async getConsultasPorSemanaPorVet(id_veterinario) {
    return await Consulta.findAll({
      where: { id_veterinario },
      attributes: [
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_consulta")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad"]
      ],
      group: ["semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_consulta")), "ASC"]]
    });
  }

  async getVacunasPorSemana() {
    return await VacunaxMascota.findAll({
      where: {
        fecha_aplicacion: { [Op.not]: null }
      },
      attributes: [
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_aplicacion")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad"]
      ],
      group: ["semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_aplicacion")), "ASC"]]
    });
  }

  async getVacunasPorSemanaPorVet(id_veterinario) {
    return await VacunaxMascota.findAll({
      where: { id_veterinario, fecha_aplicacion: { [Op.not]: null } },
      attributes: [
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_aplicacion")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad"]
      ],
      group: ["semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_aplicacion")), "ASC"]]
    });
  }

  async getGananciasConsultasPorSemana(id_veterinario) {
    return await Consulta.findAll({
      where: { id_veterinario },
      attributes: [
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_consulta")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "cantidad_consultas"]
      ],
      group: ["semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_consulta")), "ASC"]]
    });
  }

  async getGananciasServiciosPorSemana(id_veterinario) {
  return await Servicios.findAll({
    where: { id_personal_confirmado: id_veterinario },
    include: [
      {
        model: TiposServicio,
        as: "tipo_servicio",
        attributes: [] 
      }
    ],
    attributes: [
      [
        Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")),
        "semana"
      ],
      [
        Sequelize.fn("SUM", Sequelize.col("tipo_servicio.costo")),
        "total_ganancias"
      ]
    ],
    group: ["semana"],
    order: [
      [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")), "ASC"]
    ]
  });
}

async getGananciasTotales(id_veterinario, costoConsulta) {
  const consultas = await Consulta.count({
    where: { id_veterinario }
  });

  const totalConsultas = consultas * costoConsulta;

  const servicios = await Servicios.findAll({
    where: { id_personal_confirmado: id_veterinario },
    include: [
      {
        model: TiposServicio,
        as: "tipo_servicio",
        attributes: ["costo"]
      }
    ]
  });

  let totalServicios = 0;

  servicios.forEach(s => {
    const costo = Number(s.tipo_servicio?.costo || 0);
    totalServicios += costo;
  });

  return {
    totalConsultas,
    totalServicios,
    totalGlobal: totalConsultas + totalServicios
  };
}

async getCantidadPorTipoServicio() {
    return await Servicios.findAll({
      attributes: [
        "id_tipo_servicio",
        [Sequelize.fn("COUNT", Sequelize.col("Servicios.id")), "cantidad"]
      ],
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["nombre", "descripcion", "costo"]
        }
      ],
      group: ["id_tipo_servicio", "tipo_servicio.id"]
    });
  }

  // Cantidad de cada tipo de servicio por semana
  async getCantidadPorTipoServicioPorSemana() {
    return await Servicios.findAll({
      attributes: [
        "id_tipo_servicio",
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("Servicios.id")), "cantidad"]
      ],
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["nombre", "descripcion", "costo"]
        }
      ],
      group: ["id_tipo_servicio", "tipo_servicio.id", "semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")), "ASC"]]
    });
  }

  // Cantidad de cada tipo de servicio por veterinario y por semana
  async getCantidadPorTipoServicioPorVetYSemana(id_veterinario) {
    return await Servicios.findAll({
      where: { id_personal_confirmado: id_veterinario },
      attributes: [
        "id_tipo_servicio",
        [Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")), "semana"],
        [Sequelize.fn("COUNT", Sequelize.col("Servicios.id")), "cantidad"]
      ],
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["nombre", "descripcion", "costo"]
        }
      ],
      group: ["id_tipo_servicio", "tipo_servicio.id", "semana"],
      order: [[Sequelize.fn("YEARWEEK", Sequelize.col("fecha_hora_solicitada")), "ASC"]]
    });
  }

}

module.exports = new EstadisticasRepository();
