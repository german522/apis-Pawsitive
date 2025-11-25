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

      // Si cambias stock_actual manualmente, podríamos registrar movimiento de ajuste.
      const prevStock = producto.stock_actual;
      if (typeof cambios.stock_actual !== "undefined" && cambios.stock_actual !== prevStock) {
        // Ajuste de stock -> registramos entrada o salida según el caso
        const diff = cambios.stock_actual - prevStock;
        const tipo = diff > 0 ? "entrada" : "salida";
        const cantidad = Math.abs(diff);

        // Actualizamos stock aquí
        producto.stock_actual = cambios.stock_actual;
        // aplicamos otros cambios
        delete cambios.stock_actual;
        Object.assign(producto, cambios);
        await producto.save({ transaction: t });

        await MovimientoInventarioRepository.crearMovimiento(
          {
            id_producto: producto.id,
            id_responsable: idVeterinario,
            tipo,
            cantidad,
            motivo: "Ajuste de stock por actualización de producto"
          },
          { transaction: t }
        );

        return producto;
      }

      // Si no hay cambio de stock, solo actualizamos y registramos movimiento genérico
      Object.assign(producto, cambios);
      await producto.save({ transaction: t });

      await MovimientoInventarioRepository.crearMovimiento(
        {
          id_producto: producto.id,
          id_responsable: idVeterinario,
          tipo: "entrada", // marcamos como entrada semántica (puede ser 0 cantidad)
          cantidad: 0,
          motivo: "Actualización de datos del producto"
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

      const stock = producto.stock_actual || 0;
      producto.estado = "inactivo";
      producto.stock_actual = 0;
      await producto.save({ transaction: t });

      await MovimientoInventarioRepository.crearMovimiento(
        {
          id_producto: producto.id,
          id_responsable: idVeterinario,
          tipo: "salida",
          cantidad: stock,
          motivo: "Eliminación/inactivación de producto"
        },
        { transaction: t }
      );

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
