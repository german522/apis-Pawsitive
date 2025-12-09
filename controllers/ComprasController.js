const { Compra, CompraDetalle, Carrito, CarritoItem, Producto, MovimientoInventario } = require("../models");
const sequelize = require("../models").sequelize;

module.exports = {
  // 8️⃣ Crear compra desde un carrito cerrado
  crearCompra: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const id_cliente = req.user.id;
      const { metodo_pago } = req.body;

      // Buscar carrito cerrado del cliente
      const carrito = await Carrito.findOne({
        where: { id_cliente, estado: "cerrado" },
        include: [
          {
            model: CarritoItem,
            as: "items",
            include: [{ model: Producto, as: "producto" }]
          }
        ],
        transaction: t
      });

      if (!carrito) {
        await t.rollback();
        return res.status(404).json({ message: "No hay carrito cerrado" });
      }

      // Verificar si ya tiene compra
      const compraExistente = await Compra.findOne({
        where: { id_carrito: carrito.id },
        transaction: t
      });

      if (compraExistente) {
        await t.rollback();
        return res.status(400).json({ message: "El carrito ya tiene una compra registrada" });
      }

      // Calcular total congelado
      const total = carrito.items.reduce((sum, item) => {
        return sum + (item.cantidad * item.producto.precio);
      }, 0);

      // Crear compra
      const compra = await Compra.create(
        {
          id_carrito: carrito.id,
          id_veterinario: carrito.id_veterinario,
          metodo_pago,
          total
        },
        { transaction: t }
      );

      // Crear detalles congelando precio actual
      for (const item of carrito.items) {
        await CompraDetalle.create(
          {
            id_compra: compra.id,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio
          },
          { transaction: t }
        );
      }

      await t.commit();
      res.json({ message: "Compra creada correctamente", compra });

    } catch (error) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  },

  // 9️⃣ Actualizar estado de pago
  actualizarEstadoPago: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { estado_pago } = req.body;

      const compra = await Compra.findByPk(id, {
        include: [
          {
            model: CompraDetalle,
            as: "detalles",
            include: [{ model: Producto, as: "producto" }]
          }
        ],
        transaction: t
      });

      if (!compra) {
        await t.rollback();
        return res.status(404).json({ message: "Compra no encontrada" });
      }

      compra.estado_pago = estado_pago;
      await compra.save({ transaction: t });

      // Si el pago se completó → DESCONTAR inventario + generar movimiento
      if (estado_pago === "pagado") {
        for (const item of compra.detalles) {
          const producto = item.producto;

          // Usar el campo correcto 'stock_actual' según los logs
          if (producto.stock_actual < item.cantidad) {
            await t.rollback();
            return res.status(400).json({
              message: `No hay suficiente stock del producto ID: ${producto.id}`
            });
          }

          // Descontar stock
          producto.stock_actual -= item.cantidad;
          await producto.save({ transaction: t });

          // Registrar movimiento de inventario
          await MovimientoInventario.create(
            {
              id_producto: producto.id,
              tipo: "venta",
              cantidad: item.cantidad,
              descripcion: `Venta compra ID ${compra.id}`
            },
            { transaction: t }
          );
        }
      }

      await t.commit();
      res.json({ message: "Estado de pago actualizado", compra });

    } catch (error) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  },

  // 🔟 Obtener detalle de compra
  obtenerCompraPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const compra = await Compra.findByPk(id, {
        include: [
          {
            model: CompraDetalle,
            as: "detalles",
            include: [{ model: Producto, as: "producto" }]
          }
        ]
      });

      if (!compra)
        return res.status(404).json({ message: "Compra no encontrada" });

      res.json(compra);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 1️⃣1️⃣ Obtener compras por cliente
  obtenerComprasCliente: async (req, res) => {
    try {
      const id_cliente = req.user.id;

      const compras = await Compra.findAll({
        include: [
          {
            model: Carrito,
            as: "carrito",
            where: { id_cliente }
          }
        ]
      });

      res.json(compras);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 1️⃣2️⃣ Obtener ventas de un veterinario
  obtenerVentasVeterinario: async (req, res) => {
    try {
      const id_veterinario = req.user.id;

      const compras = await Compra.findAll({
        where: { id_veterinario }
      });

      res.json(compras);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
