const { TiposServicio, Servicios, Mascota, Cliente, Veterinario, Persona } = require("../models");

class ServiciosRepository {
  async getDetallesServicio(id) {
    const servicio = await Servicios.findOne({
      where: { id },
      include: [
        { model: TiposServicio, as: "tipo_servicio", attributes: ["nombre" , "descripcion" , "costo"] },
        { model: Mascota, as: "mascota", attributes: ["nombre"] },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: ["nombre", "correo"]
            }
          ]
        },
        {
          model: Veterinario,
          as: "veterinario",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: ["nombre", "correo"]
            }
          ]
        }
      ]
    });

    if (!servicio) return null;

    const fechaObj = new Date(servicio.fecha_hora_solicitada);
    const fecha = fechaObj.toLocaleDateString("es-MX");
    const hora = fechaObj.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return {
      clienteNombre: servicio.cliente?.persona?.nombre,
      veterinarioNombre: servicio.veterinario?.persona?.nombre || "Sin asignar",
      mascotaNombre: servicio.mascota?.nombre,
      tipoServicioNombre: servicio.tipo_servicio?.nombre,
      fecha,
      hora,
      clienteEmail: servicio.cliente?.persona?.correo,
      veterinarioEmail: servicio.veterinario?.persona?.correo
    };
  }

  async getAll() {
    return await Servicios.findAll({
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre" , "descripcion" , "costo"]
        },
        {
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre", "especie", "raza"]
        },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno",
                "telefono"
              ]
            }
          ]
        },
        {
          model: Veterinario,
          as: "veterinario",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno"
              ]
            }
          ]
        }
      ],
      order: [["fecha_hora_solicitada", "DESC"]]
    });
  }

  async getById(id) {
    return await Servicios.findByPk(id, {
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre" , "descripcion" , "costo"]
        },
        {
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre", "especie", "raza"]
        },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno",
                "telefono"
              ]
            }
          ]
        },
        {
          model: Veterinario,
          as: "veterinario",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno"
              ]
            }
          ]
        }
      ]
    });
  }

  async create(data) {
    return await Servicios.create(data);
  }

  async update(id, data) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) return null;
    return await servicio.update(data);
  }

  async delete(id) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) return false;
    await servicio.destroy();
    return true;
  }

  async getByCliente(id_cliente) {
    return await Servicios.findAll({
      where: { id_cliente },
      include: [
        { model: TiposServicio, as: "tipo_servicio", attributes: ["id", "nombre" , "descripcion" , "costo"] },
        { model: Mascota, as: "mascota", attributes: ["id", "nombre", "especie"] }
      ],
      order: [["fecha_hora_solicitada", "DESC"]]
    });
  }

  async getByMascota(id_mascota) {
    return await Servicios.findAll({
      where: { id_mascota },
      include: [
        { model: TiposServicio, as: "tipo_servicio", attributes: ["id", "nombre" , "descripcion" , "costo"] }
      ],
      order: [["fecha_hora_solicitada", "DESC"]]
    });
  }

  async getByEstado(estado) {
    return await Servicios.findAll({
      where: { estado },
      include: [
        { model: TiposServicio, as: "tipo_servicio", attributes: ["id", "nombre" , "descripcion" , "costo"] },
        { model: Mascota, as: "mascota", attributes: ["id", "nombre", "especie"] },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona",
              attributes: [
                "id",
                "nombre",
                "apellido_paterno",
                "apellido_materno"
              ]
            }
          ]
        }
      ],
      order: [["fecha_hora_solicitada", "ASC"]]
    });
  }

  async updateEstado(id, estado) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) return null;
    return await servicio.update({ estado });
  }

  async assignVeterinario(id, id_personal_confirmado) {
    const servicio = await Servicios.findByPk(id);
    if (!servicio) return null;
    return await servicio.update({
      id_personal_confirmado,
      estado: "Confirmado"
    });
  }
}

module.exports = new ServiciosRepository();
