const MovimientoInventarioRepository = require("../repositories/MovimientoInventarioRepository");

const MovimientoController = {
  // 12. GET /movimientos
  obtenerMovimientos: async (req, res) => {
    try {
      const filtro = {};
      if (req.query.tipo) filtro.tipo = req.query.tipo;
      if (req.query.id_producto) filtro.id_producto = req.query.id_producto;
      if (req.query.id_responsable) filtro.id_responsable = req.query.id_responsable;
      if (req.query.fecha_inicio || req.query.fecha_fin) {
        const { Op } = require("sequelize");
        filtro.fecha_movimiento = {};
        if (req.query.fecha_inicio) filtro.fecha_movimiento[Op.gte] = new Date(req.query.fecha_inicio);
        if (req.query.fecha_fin) filtro.fecha_movimiento[Op.lte] = new Date(req.query.fecha_fin);
      }

      const movimientos = await MovimientoInventarioRepository.obtenerTodos({ filtro });
      return res.json(movimientos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al obtener movimientos" });
    }
  },

  // 13. GET /movimientos/:id
  detalleMovimiento: async (req, res) => {
    try {
      const mov = await MovimientoInventarioRepository.obtenerPorId(req.params.id);
      if (!mov) return res.status(404).json({ message: "Movimiento no encontrado" });
      return res.json(mov);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al obtener detalle de movimiento" });
    }
  }
};

module.exports = MovimientoController;
