const {
  Servicios,
  TiposServicio,
  Mascotas,
  Clientes,
  Veterinarios,
  Personas,
} = require("../models");

class ServiciosRepository {
  async findAll() {
    return await Servicios.findAll({
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre", "descripcion"],
        },
        {
          model: Mascotas,
          as: "mascota",
          attributes: ["id", "nombre", "especie", "raza"],
        },
        {
          model: Clientes,
          as: "cliente",
          include: [
            {
              model: Personas,
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno",
                "telefono",
              ],
            },
          ],
        },
        {
          model: Veterinarios,
          as: "veterinario",
          include: [
            {
              model: Personas,
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno",
              ],
            },
          ],
        },
      ],
      order: [["fecha_hora_solicitada", "DESC"]],
    });
  }

  async findById(id) {
    return await Servicios.findByPk(id, {
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre", "descripcion"],
        },
        {
          model: Mascotas,
          as: "mascota",
          attributes: ["id", "nombre", "especie", "raza"],
        },
        {
          model: Clientes,
          as: "cliente",
          include: [
            {
              model: Personas,
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno",
                "telefono",
              ],
            },
          ],
        },
        {
          model: Veterinarios,
          as: "veterinario",
          include: [
            {
              model: Personas,
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno",
              ],
            },
          ],
        },
      ],
    });
  }

  async create(servicioData) {
    return await Servicios.create(servicioData);
  }

  async update(id, servicioData) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) {
      return null;
    }
    return await servicio.update(servicioData);
  }

  async delete(id) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) {
      return false;
    }
    await servicio.destroy();
    return true;
  }

  async findByCliente(id_cliente) {
    return await Servicios.findAll({
      where: { id_cliente },
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre"],
        },
        {
          model: Mascotas,
          as: "mascota",
          attributes: ["id", "nombre", "especie"],
        },
      ],
      order: [["fecha_hora_solicitada", "DESC"]],
    });
  }

  async findByMascota(id_mascota) {
    return await Servicios.findAll({
      where: { id_mascota },
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre"],
        },
      ],
      order: [["fecha_hora_solicitada", "DESC"]],
    });
  }

  async findByEstado(estado) {
    return await Servicios.findAll({
      where: { estado },
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre"],
        },
        {
          model: Mascotas,
          as: "mascota",
          attributes: ["id", "nombre", "especie"],
        },
        {
          model: Clientes,
          as: "cliente",
          include: [
            {
              model: Personas,
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno",
              ],
            },
          ],
        },
      ],
      order: [["fecha_hora_solicitada", "ASC"]],
    });
  }

  async updateEstado(id, estado) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) {
      return null;
    }
    return await servicio.update({ estado });
  }

  async assignVeterinario(id, id_personal_confirmado) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) {
      return null;
    }
    return await servicio.update({
      id_personal_confirmado,
      estado: "Confirmado",
    });
  }
}

module.exports = new ServiciosRepository();
