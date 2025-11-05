// repositories/ConsultaRepository.js
const { Consulta, Cita, Mascota, Persona, Veterinario } = require('../models');

class ConsultaRepository {
  async crearConsulta(data) {
    return await Consulta.create(data);
  }

  async obtenerPorId(id) {
    return await Consulta.findByPk(id, {
      include: [
        {
          model: Cita,
          as: 'cita',
          include: [
            { model: Mascota, attributes: ['nombre'] },
            { model: Persona, as: 'cliente', attributes: ['nombre', 'correo'] },
            { 
              model: Veterinario, 
              include: { model: Persona, as: 'persona', attributes: ['nombre', 'correo'] } 
            }
          ]
        }
      ]
    });
  }

  async obtenerPorCita(id_cita) {
    return await Consulta.findOne({
      where: { id_cita },
      include: [{ model: Cita, as: 'cita' }]
    });
  }

  async listarConsultas() {
    return await Consulta.findAll({
      include: [
        {
          model: Cita,
          as: 'cita',
          include: [
            { model: Mascota, attributes: ['nombre'] },
            { model: Persona, as: 'cliente', attributes: ['nombre'] },
            { 
              model: Veterinario, 
              include: { model: Persona, as: 'persona', attributes: ['nombre'] } 
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async actualizarConsulta(id, data) {
    const consulta = await Consulta.findByPk(id);
    if (!consulta) return null;
    await consulta.update(data);
    return consulta;
  }

  async eliminarConsulta(id) {
    const consulta = await Consulta.findByPk(id);
    if (!consulta) return null;
    await consulta.destroy();
    return true;
  }
}

module.exports = new ConsultaRepository();
