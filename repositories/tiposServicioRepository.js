const { TiposServicio } = require("../models");

class TiposServicioRepository {
  async findAll() {
    return await TiposServicio.findAll({
      order: [["nombre", "ASC"]],
    });
  }

  async findById(id) {
    return await TiposServicio.findByPk(id);
  }

  async create(tipoServicioData) {
    return await TiposServicio.create(tipoServicioData);
  }

  async update(id, tipoServicioData) {
    const tipoServicio = await TiposServicio.findByPk(id);
    if (!tipoServicio) {
      return null;
    }
    return await tipoServicio.update(tipoServicioData);
  }

  async delete(id) {
    const tipoServicio = await TiposServicio.findByPk(id);
    if (!tipoServicio) {
      return false;
    }
    await tipoServicio.destroy();
    return true;
  }

  async findByName(nombre) {
    return await TiposServicio.findOne({ where: { nombre } });
  }
}

module.exports = new TiposServicioRepository();
