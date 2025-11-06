const tiposServicioRepository = require("../repositories/tiposServicioRepository");

class TiposServicioController {
  async getAll(req, res) {
    try {
      const tiposServicio = await tiposServicioRepository.findAll();
      res.json({
        success: true,
        data: tiposServicio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los tipos de servicio",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const tipoServicio = await tiposServicioRepository.findById(id);

      if (!tipoServicio) {
        return res.status(404).json({
          success: false,
          message: "Tipo de servicio no encontrado",
        });
      }

      res.json({
        success: true,
        data: tipoServicio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el tipo de servicio",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      // Validar que el nombre no exista
      const existingTipo = await tiposServicioRepository.findByName(nombre);
      if (existingTipo) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un tipo de servicio con ese nombre",
        });
      }

      const tipoServicio = await tiposServicioRepository.create({
        nombre,
        descripcion,
      });

      res.status(201).json({
        success: true,
        message: "Tipo de servicio creado exitosamente",
        data: tipoServicio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el tipo de servicio",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      const tipoServicio = await tiposServicioRepository.update(id, {
        nombre,
        descripcion,
      });

      if (!tipoServicio) {
        return res.status(404).json({
          success: false,
          message: "Tipo de servicio no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Tipo de servicio actualizado exitosamente",
        data: tipoServicio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el tipo de servicio",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await tiposServicioRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Tipo de servicio no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Tipo de servicio eliminado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el tipo de servicio",
        error: error.message,
      });
    }
  }
}

module.exports = new TiposServicioController();
