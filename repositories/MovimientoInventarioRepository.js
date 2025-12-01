const { MovimientoInventario } = require("../models");

class MovimientoInventarioRepository {
  async crearMovimiento({ id_producto, id_responsable, tipo, cantidad = 0, motivo = null }, options = {}) {
    return await MovimientoInventario.create(
      { id_producto, id_responsable, tipo, cantidad, motivo },
      options
    );
  }

  async obtenerTodos({ filtro = {}, limit = 100, offset = 0 } = {}) {
    return await MovimientoInventario.findAll({
      where: filtro,
      include: [
        { association: "producto" },       
        { association: "responsable" }     
      ],
      order: [["fecha_movimiento", "DESC"]],
      limit,
      offset
    });
  }

  async obtenerPorId(id) {
    return await MovimientoInventario.findByPk(id, {
      include: [
        { association: "producto" },
        { association: "responsable" }
      ]
    });
  }
}

module.exports = new MovimientoInventarioRepository();
