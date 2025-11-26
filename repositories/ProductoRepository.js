const { Producto, sequelize } = require("../models");
const MovimientoInventarioRepository = require("./MovimientoInventarioRepository");

class ProductoRepository {
  // Crear producto + movimiento entrada (transaccional)
  async crearProducto(data, idResponsable) {
  return await sequelize.transaction(async (t) => {
    // 1. Crear producto
    const producto = await Producto.create(data, { transaction: t });

    // 2. Crear movimiento de inventario
    await MovimientoInventarioRepository.crearMovimiento(
      {
        id_producto: producto.id,
        id_responsable: idResponsable, // 👈 ESTE ERA EL FALTANTE
        tipo: "entrada",
        cantidad: data.stock_actual || 0,
        motivo: "Registro inicial del producto"
      },
      { transaction: t }
    );

    return producto;
  });
}

  // Adjuntar imagen (solo actualiza URL_imagen) + movimiento (cantidad 0)
 async adjuntarImagen(id, url) {
  return await sequelize.transaction(async (t) => {
    const producto = await Producto.findByPk(id, { transaction: t });

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    // Asignar solo el string
    producto.URL_imagen = url;

    // Obligamos a marcar el campo como modificado
    producto.changed("URL_imagen", true);

    await producto.save({ transaction: t });

    return producto;
  });
}


  // Obtener productos (uso veterinario: todos, con filtros)
  async obtenerProductos({ filtros = {}, limit = 50, offset = 0 } = {}) {
    const where = { };
    if (filtros.categoria) where.id_categoria = filtros.categoria;
    if (filtros.especie) where.id_especie = filtros.especie;
    if (filtros.tipo_producto) where.id_tipo_producto = filtros.tipo_producto;
    if (filtros.estado) where.estado = filtros.estado;

    return await Producto.findAll({
      where,
      limit,
      offset,
      order: [["nombre", "ASC"]]
    });
  }

  // Obtener productos restringidos (requiere_receta = true) - veterinarios
  async obtenerRestringidos({ filtros = {}, limit = 50, offset = 0 } = {}) {
    return this.obtenerProductos({
      filtros: { ...filtros, requiere_receta: true, estado: "activo" },
      limit,
      offset
    });
  }

  // Obtener productos libre (requiere_receta = false) - clientes
  async obtenerLibres({ filtros = {}, limit = 50, offset = 0 } = {}) {
    return Producto.findAll({
      where: {
        ...filtros,
        requiere_receta: false,
        estado: "activo"
      },
      limit,
      offset,
      order: [["nombre", "ASC"]]
    });
  }

  async obtenerPorId(id) {
    return await Producto.findByPk(id);
  }

  // Actualizar producto (solo veterinario) + movimiento (cantidad 0)
  async actualizarProducto(id, cambios, idVeterinario) {
  return await sequelize.transaction(async (t) => {
    const producto = await Producto.findByPk(id, { transaction: t });
    if (!producto) throw new Error("Producto no encontrado");

    const prevStock = producto.stock_actual;

    // Si viene stock_actual en el body → lo usamos como incremento o decremento
    if (typeof cambios.stock_actual !== "undefined") {
      const incremento = Number(cambios.stock_actual);

      // Nuevo stock = actual en BD + lo enviado
      const nuevoStock = prevStock + incremento;

      // Determinar movimiento
      const tipo = incremento > 0 ? "entrada" : "salida";
      const cantidad = Math.abs(incremento);

      // Actualizamos stock
      producto.stock_actual = nuevoStock;

      // Quitamos stock_actual del objeto de cambios
      delete cambios.stock_actual;

      // Aplicamos los demás cambios
      Object.assign(producto, cambios);
      await producto.save({ transaction: t });

      // Registramos movimiento
      await MovimientoInventarioRepository.crearMovimiento(
        {
          id_producto: producto.id,
          id_responsable: idVeterinario,
          tipo,
          cantidad,
          motivo: "Ajuste de stock (incremento/decremento)"
        },
        { transaction: t }
      );

      return producto;
    }

    // Si no viene stock en cambios → actualización normal
    Object.assign(producto, cambios);
    await producto.save({ transaction: t });

    await MovimientoInventarioRepository.crearMovimiento(
      {
        id_producto: producto.id,
        id_responsable: idVeterinario,
        tipo: "entrada",
        cantidad: 0,
        motivo: "Actualización de datos del producto (sin cambio de stock)"
      },
      { transaction: t }
    );

    return producto;
  });
}


  // "Eliminar" producto -> marcar inactivo + registrar salida con stock_actual
  async eliminarProducto(id, idVeterinario) {
    return await sequelize.transaction(async (t) => {
        const producto = await Producto.findByPk(id, { transaction: t });
        if (!producto) throw new Error("Producto no encontrado");

        // Registrar salida de todas las unidades antes de eliminar
        await MovimientoInventarioRepository.crearMovimiento(
            {
                id_producto: id,
                id_responsable: idVeterinario,
                tipo: "salida",
                cantidad: producto.stock_actual,
                motivo: "Eliminación/inactivación de producto"
            },
            { transaction: t }
        );

        await producto.destroy({ transaction: t });

        return producto;
    });
}


  // Productos bajos en stock
  async obtenerStockBajo({ umbral = 5, limit = 100, offset = 0 } = {}) {
    return await Producto.findAll({
      where: {
        stock_actual: { [require("sequelize").Op.lte]: umbral },
        estado: "activo"
      },
      limit,
      offset,
      order: [["stock_actual", "ASC"]]
    });
  }
}

module.exports = new ProductoRepository();
