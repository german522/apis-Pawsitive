const { Producto, Categoria, Especie, TipoProducto, sequelize } = require("../models");
const MovimientoInventarioRepository = require("./MovimientoInventarioRepository");

// Centralizamos los includes para no repetirlos N veces
const productoIncludes = [
  { model: Categoria, as: "categoria", attributes: ["id", "nombre"] },
  { model: Especie, as: "especie", attributes: ["id", "nombre"] },
  { model: TipoProducto, as: "tipo_producto", attributes: ["id", "nombre"] }
];

class ProductoRepository {

  // ===========================
  // CREAR PRODUCTO
  // ===========================
  async crearProducto(data, idResponsable) {
    return await sequelize.transaction(async (t) => {
      const producto = await Producto.create(data, { transaction: t });

      await MovimientoInventarioRepository.crearMovimiento(
        {
          id_producto: producto.id,
          id_responsable: idResponsable,
          tipo: "entrada",
          cantidad: data.stock_actual || 0,
          motivo: "Registro inicial del producto"
        },
        { transaction: t }
      );

      return await Producto.findByPk(producto.id, {
        include: productoIncludes,
        transaction: t
      });
    });
  }

  // ===========================
  // ADJUNTAR IMAGEN
  // ===========================
  async adjuntarImagen(id, url) {
    return await sequelize.transaction(async (t) => {
      const producto = await Producto.findByPk(id, { transaction: t });
      if (!producto) throw new Error("Producto no encontrado");

      producto.URL_imagen = url;
      producto.changed("URL_imagen", true);
      await producto.save({ transaction: t });

      return await Producto.findByPk(id, {
        include: productoIncludes,
        transaction: t
      });
    });
  }

  // ===========================
  // OBTENER PRODUCTOS
  // ===========================
  async obtenerProductos({ filtros = {}, limit = 50, offset = 0 } = {}) {

    const where = {};

    if (filtros.categoria) where.id_categoria = filtros.categoria;
    if (filtros.especie) where.id_especie = filtros.especie;
    if (filtros.tipo_producto) where.id_tipo_producto = filtros.tipo_producto;
    if (typeof filtros.requiere_receta !== "undefined")
      where.requiere_receta = filtros.requiere_receta;
    if (filtros.estado) where.estado = filtros.estado;

    return await Producto.findAll({
      where,
      limit,
      offset,
      include: productoIncludes,
      order: [["nombre", "ASC"]]
    });
  }

  // ===========================
  // RESTRINGIDOS (RECETA)
  // ===========================
  async obtenerRestringidos({ filtros = {}, limit = 50, offset = 0 } = {}) {
    return this.obtenerProductos({
      filtros: { ...filtros, requiere_receta: true, estado: "activo" },
      limit,
      offset
    });
  }

  // ===========================
  // LIBRES (SIN RECETA)
  // ===========================
  async obtenerLibres({ filtros = {}, limit = 50, offset = 0 } = {}) {
    return await Producto.findAll({
      where: {
        ...filtros,
        requiere_receta: false,
        estado: "activo"
      },
      include: productoIncludes,
      limit,
      offset,
      order: [["nombre", "ASC"]]
    });
  }

  // ===========================
  // OBTENER POR ID
  // ===========================
  async obtenerPorId(id) {
    return await Producto.findByPk(id, {
      include: productoIncludes
    });
  }

  // ===========================
  // ACTUALIZAR PRODUCTO
  // ===========================
  async actualizarProducto(id, cambios, idVeterinario) {
    return await sequelize.transaction(async (t) => {

      const producto = await Producto.findByPk(id, { transaction: t });
      if (!producto) throw new Error("Producto no encontrado");

      const prevStock = producto.stock_actual;

      // Ajuste de stock
      if (typeof cambios.stock_actual !== "undefined") {
        const incremento = Number(cambios.stock_actual);
        const nuevoStock = prevStock + incremento;

        const tipo = incremento > 0 ? "entrada" : "salida";
        const cantidad = Math.abs(incremento);

        producto.stock_actual = nuevoStock;

        delete cambios.stock_actual;
        Object.assign(producto, cambios);

        await producto.save({ transaction: t });

        await MovimientoInventarioRepository.crearMovimiento(
          {
            id_producto: producto.id,
            id_responsable: idVeterinario,
            tipo,
            cantidad,
            motivo: "Ajuste de stock"
          },
          { transaction: t }
        );

        return await Producto.findByPk(producto.id, {
          include: productoIncludes,
          transaction: t
        });
      }

      // Actualización normal
      Object.assign(producto, cambios);
      await producto.save({ transaction: t });

      await MovimientoInventarioRepository.crearMovimiento(
        {
          id_producto: producto.id,
          id_responsable: idVeterinario,
          tipo: "entrada",
          cantidad: 0,
          motivo: "Actualización de datos"
        },
        { transaction: t }
      );

      return await Producto.findByPk(producto.id, {
        include: productoIncludes,
        transaction: t
      });
    });
  }

  // ===========================
  // ELIMINAR PRODUCTO
  // ===========================
  async eliminarProducto(id, idVeterinario) {
    return await sequelize.transaction(async (t) => {
      const producto = await Producto.findByPk(id, { transaction: t });
      if (!producto) throw new Error("Producto no encontrado");

      await MovimientoInventarioRepository.crearMovimiento(
        {
          id_producto: id,
          id_responsable: idVeterinario,
          tipo: "salida",
          cantidad: producto.stock_actual,
          motivo: "Eliminación de producto"
        },
        { transaction: t }
      );

      await producto.destroy({ transaction: t });

      return producto; // si quieres devolver con includes, te lo agrego
    });
  }

  // ===========================
  // STOCK BAJO
  // ===========================
  async obtenerStockBajo({ umbral = 5, limit = 50, offset = 0 } = {}) {
    return await Producto.findAll({
      where: {
        stock_actual: { [Op.lt]: umbral },
        estado: "activo"
      },
      include: productoIncludes,
      limit,
      offset,
      order: [["stock_actual", "ASC"]]
    });
  }
}

module.exports = new ProductoRepository();
