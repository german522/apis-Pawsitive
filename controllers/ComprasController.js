const { Cliente, Persona, Compra, CompraDetalle, Carrito, CarritoItem, Producto, MovimientoInventario, Veterinario } = require("../models");
const sequelize = require("../models").sequelize;
const emailService = require("../utils/emailService");
const FolioUtils = require("../utils/RecetaUtils"); // Asumiendo que esta utilidad genera folios

module.exports = {
  crearCompra: async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const id_persona_autenticada = req.user.id; 
        const user = req.user; 
        const { metodo_pago, id_carrito, id_veterinario } = req.body; 

        if (!metodo_pago) {
             await t.rollback();
             return res.status(400).json({ message: "Método de pago es requerido" });
        }
        
        // Variables de asignación
        let id_veterinario_asignado;
        const id_usuario_rol = user.tipoId; 
        
        // 1. LÓGICA DE ASIGNACIÓN DE VETERINARIO (Nueva Lógica Detallada)
        if (user.tipo === 'veterinario') {
            // Veterinario compra para uso interno: Él es el responsable
            id_veterinario_asignado = id_usuario_rol; 
        } else if (user.tipo === 'cliente') {
            // Cliente compra: El veterinario debe ser provisto en el body
            if (!id_veterinario) {
                await t.rollback();
                return res.status(400).json({ message: "Como Cliente, el 'id_veterinario' es obligatorio en el body para la compra." });
            }

            // Validamos que el id_veterinario provisto realmente exista
            const veterinarioExiste = await Veterinario.findByPk(id_veterinario, { attributes: ['id'] });
            if (!veterinarioExiste) {
                await t.rollback();
                return res.status(404).json({ message: "El id_veterinario proporcionado no es válido." });
            }
            id_veterinario_asignado = id_veterinario;

        } else {
            await t.rollback();
            return res.status(403).json({ message: "Rol no autorizado para crear compras." });
        }
        
        // 2. CARGAR CARRITO (Unificado por id_persona)
        const carrito = await Carrito.findOne({
            where: { 
                id: id_carrito, 
                id_persona: id_persona_autenticada, // Validamos pertenencia por Persona
                estado: "cerrado" 
            },
            include: [
                {
                    model: CarritoItem,
                    as: "items",
                    include: [{ model: Producto, as: "producto", attributes: ['id', 'nombre', 'precio', 'stock_actual'] }] 
                }
            ],
            transaction: t
        });

        if (!carrito) {
            await t.rollback();
            return res.status(404).json({ message: "Carrito no encontrado, no está cerrado o no te pertenece." });
        }

        // 3. VALIDACIONES BÁSICAS
        const compraExistente = await Compra.findOne({ where: { id_carrito: carrito.id }, transaction: t });
        if (compraExistente) {
            await t.rollback();
            return res.status(400).json({ message: "El carrito ya tiene una compra registrada" });
        }
        if (!carrito.items || carrito.items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: "El carrito está vacío." });
        }

        // 4. PROCESAMIENTO DE ITEMS Y STOCK
        const detallesCompra = [];
        let totalCompra = 0;
        const folioMovimiento = FolioUtils.generateFolio(); 

        for (const item of carrito.items) {
            const producto = item.producto;
            const cantidadRequerida = item.cantidad;
            const precioCongelado = parseFloat(producto.precio); 

            // VALIDACIÓN DE STOCK
            if (producto.stock_actual < cantidadRequerida) {
                await t.rollback();
                return res.status(400).json({
                    message: `Stock insuficiente para el producto '${producto.nombre}'. Requerido: ${cantidadRequerida}, Disponible: ${producto.stock_actual}.`
                });
            }

            totalCompra += (cantidadRequerida * precioCongelado);
            detallesCompra.push({
                id_producto: item.id_producto, cantidad: cantidadRequerida, precio_unitario: precioCongelado, producto: { nombre: producto.nombre } 
            });

            // DESCONTAR STOCK Y REGISTRAR MOVIMIENTO DE INVENTARIO
            producto.stock_actual -= cantidadRequerida;
            await producto.save({ transaction: t });

            await MovimientoInventario.create(
                {
                    id_producto: producto.id,
                    id_responsable: id_usuario_rol, // ID del Cliente o Veterinario que compró
                    tipo: "venta",
                    cantidad: cantidadRequerida,
                    motivo: `Venta Compra desde Carrito (Folio: ${folioMovimiento})`
                },
                { transaction: t }
            );
        } // Fin del bucle de items

        // 5. CREAR REGISTRO DE COMPRA
        const compra = await Compra.create(
            {
                id_carrito: carrito.id,
                id_veterinario: id_veterinario_asignado, // ⬅️ ID válido garantizado por la Lógica 1
                metodo_pago,
                total: totalCompra,
                estado_pago: 'pagado'
            },
            { transaction: t }
        );

        // 6. CREAR DETALLES DE COMPRA
        for (const detalle of detallesCompra) {
            await CompraDetalle.create(
                { id_compra: compra.id, id_producto: detalle.id_producto, cantidad: detalle.cantidad, precio_unitario: detalle.precio_unitario },
                { transaction: t }
            );
        }

        // 7. CONFIRMAR TRANSACCIÓN
        await t.commit(); 
        
        // 8. NOTIFICACIÓN POR CORREO
        if (user.tipo === 'cliente') {
            try {
                const persona = await Persona.findByPk(id_persona_autenticada, { attributes: ['correo', 'nombre'] });
                const correoDestino = persona?.correo;
                const nombreCliente = persona?.nombre; 

                if (correoDestino && nombreCliente) {
                    await emailService.enviarCorreoConfirmacionCompra({
                        data: {
                            toCliente: correoDestino, clienteNombre: nombreCliente, folio: folioMovimiento,
                            total: compra.total, detalles: detallesCompra, 
                        }
                    });
                }
            } catch (emailError) {
                 console.error('[ERROR CORREO] Fallo al enviar correo de confirmación de compra:', emailError.message);
            }
        } 
        
        return res.status(201).json({ 
            message: `Compra creada y stock descontado (${user.tipo}).`, 
            compra: {...compra.toJSON(), folioMovimiento},
            detalleMovimiento: `Folio de movimiento ${folioMovimiento} generado.`
        });

    } catch (error) {
        if (!t.finished) {
            await t.rollback();
        }
        console.error('Error al crear compra:', error);
        return res.status(500).json({ message: error.message || "Error interno al crear compra" });
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
