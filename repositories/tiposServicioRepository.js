const { TiposServicio } = require("../models");

class TiposServicioRepository {
  async getAll() {
    return await TiposServicio.findAll({
      order: [["nombre", "ASC"]],
      attributes: ["id", "nombre", "descripcion", "costo"]
    });
  }

  async getById(id) {
    return await TiposServicio.findByPk(id);
  }

  async create(data) {
    return await TiposServicio.create(data);
  }

  async update(id, data) {
    const tipoServicio = await TiposServicio.findByPk(id);
    if (!tipoServicio) return null;
    return await tipoServicio.update(data);
  }

  async delete(id) {
    const tipoServicio = await TiposServicio.findByPk(id);
    if (!tipoServicio) return false;
    await tipoServicio.destroy();
    return true;
  }

  async getByName(nombre) {
    return await TiposServicio.findOne({ where: { nombre } });
  }
}

module.exports = new TiposServicioRepository();
