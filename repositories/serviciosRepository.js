const {
  TiposServicio,
  Servicios,
  Mascota,
  Cliente,
  Veterinario,
  Persona,
} = require("../models");

class ServiciosRepository {
  async getDetallesServicio(id_servicio) {
    const servicio = await Servicios.findOne({
      where: { id: id_servicio },
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["nombre"],
        },
        {
          model: Mascota,
          as: "mascota",
          attributes: ["nombre"],
        },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona", // ← AGREGAR 'as' aquí
              attributes: ["nombre", "correo"],
            },
          ],
        },
        {
          model: Veterinario,
          as: "veterinario",
          include: [
            {
              model: Persona,
              as: "persona", // ← AGREGAR 'as' aquí
              attributes: ["nombre", "correo"],
            },
          ],
        },
      ],
    });

    if (!servicio) return null;

    const fechaObj = new Date(servicio.fecha_hora_solicitada);
    const fecha = fechaObj.toLocaleDateString("es-MX");
    const hora = fechaObj.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      clienteNombre: servicio.cliente?.persona?.nombre,
      veterinarioNombre: servicio.veterinario?.persona?.nombre || "Sin asignar",
      mascotaNombre: servicio.mascota?.nombre,
      tipoServicioNombre: servicio.tipo_servicio?.nombre,
      fecha,
      hora,
      clienteEmail: servicio.cliente?.persona?.correo,
      veterinarioEmail: servicio.veterinario?.persona?.correo,
    };
  }

  async findAll() {
    return await Servicios.findAll({
      include: [
        {
          model: TiposServicio,
          as: "tipo_servicio",
          attributes: ["id", "nombre", "descripcion"],
        },
        {
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre", "especie", "raza"],
        },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona", // ← AGREGAR 'as' aquí
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
          model: Veterinario,
          as: "veterinario",
          include: [
            {
              model: Persona,
              as: "persona", // ← AGREGAR 'as' aquí
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
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre", "especie", "raza"],
        },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona", // ← AGREGAR 'as' aquí
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
          model: Veterinario,
          as: "veterinario",
          include: [
            {
              model: Persona,
              as: "persona", // ← AGREGAR 'as' aquí
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
          model: Mascota,
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
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre", "especie"],
        },
        {
          model: Cliente,
          as: "cliente",
          include: [
            {
              model: Persona,
              as: "persona", // ← AGREGAR 'as' aquí
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
