const { Expediente, Mascota } = require('../models');

const ExpedienteRepository = {
  async crearExpediente(data) {
    return await Expediente.create(data);
  },

  async obtenerExpedientes() {
    return await Expediente.findAll({
      include: [{ model: Mascota, as: 'mascota' }]
    });
  },

  async obtenerExpedientePorId(id) {
    return await Expediente.findByPk(id, {
      include: [{ model: Mascota, as: 'mascota' }]
    });
  },

  async obtenerExpedientePorMascota(id_mascota) {
    return await Expediente.findOne({
      where: { id_mascota },
      include: [{ model: Mascota, as: 'mascota' }]
    });
  },

  async actualizarExpediente(id, data) {
    const expediente = await Expediente.findByPk(id);
    if (!expediente) return null;
    await expediente.update(data);
    return expediente;
  },

  async eliminarExpediente(id) {
    const expediente = await Expediente.findByPk(id);
    if (!expediente) return null;
    await expediente.destroy();
    return true;
  }
};

module.exports = ExpedienteRepository;
