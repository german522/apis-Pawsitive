const ExpedienteRepository = require('../repositories/ExpedienteRepository');

const ExpedienteController = {
  async crearExpediente(req, res) {
    try {
      const expediente = await ExpedienteRepository.crearExpediente(req.body);
      res.status(201).json({
        message: 'Expediente creado correctamente',
        data: expediente
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear el expediente' });
    }
  },

  async obtenerExpedientes(req, res) {
    try {
      const expedientes = await ExpedienteRepository.obtenerExpedientes();
      res.status(200).json({
        message: 'Lista de expedientes obtenida correctamente',
        data: expedientes
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los expedientes' });
    }
  },

  async obtenerExpedientePorId(req, res) {
    try {
      const expediente = await ExpedienteRepository.obtenerExpedientePorId(req.params.id);
      if (!expediente) {
        return res.status(404).json({ message: 'Expediente no encontrado' });
      }
      res.status(200).json({
        message: 'Expediente obtenido correctamente',
        data: expediente
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el expediente' });
    }
  },

  async obtenerExpedientePorMascota(req, res) {
    try {
      const expediente = await ExpedienteRepository.obtenerExpedientePorMascota(req.params.id_mascota);
      if (!expediente) {
        return res.status(404).json({ message: 'Expediente no encontrado para esta mascota' });
      }
      res.status(200).json({
        message: 'Expediente de mascota obtenido correctamente',
        data: expediente
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el expediente por mascota' });
    }
  },

  async actualizarExpediente(req, res) {
    try {
      const expediente = await ExpedienteRepository.actualizarExpediente(req.params.id, req.body);
      if (!expediente) {
        return res.status(404).json({ message: 'Expediente no encontrado' });
      }
      res.status(200).json({
        message: 'Expediente actualizado correctamente',
        data: expediente
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el expediente' });
    }
  },

  async eliminarExpediente(req, res) {
    try {
      const eliminado = await ExpedienteRepository.eliminarExpediente(req.params.id);
      if (!eliminado) {
        return res.status(404).json({ message: 'Expediente no encontrado' });
      }
      res.status(200).json({ message: 'Expediente eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el expediente' });
    }
  }
};

module.exports = ExpedienteController;
