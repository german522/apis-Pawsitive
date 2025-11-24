const { Producto, Categoria, Especie, TipoProducto } = require("../models");

class ProductoRepository {
  async create(data) {
    try {
      const producto = await Producto.create(data);
      return producto;
    } catch (error) {
      throw new Error("ProductoRepository.create: " + error.message);
    }
  }

  async updateById(id, data) {
    try {
      const [updated] = await Producto.update(data, { where: { id } });
      return updated; // 0 | 1
    } catch (error) {
      throw new Error("ProductoRepository.updateById: " + error.message);
    }
  }

  async softDeleteById(id) {
    try {
      const [updated] = await Producto.update({ estado: "inactivo" }, { where: { id } });
      return updated;
    } catch (error) {
      throw new Error("ProductoRepository.softDeleteById: " + error.message);
    }
  }

  async findById(id) {
    try {
      return await Producto.findByPk(id, {
        include: [
          { model: Categoria, as: "categoria" },
          { model: Especie, as: "especie" },
          { model: TipoProducto, as: "tipo_producto" }
        ]
      });
    } catch (error) {
      throw new Error("ProductoRepository.findById: " + error.message);
    }
  }

  async findAll({ page = 1, limit = 50 } = {}) {
    try {
      const offset = (Number(page) - 1) * Number(limit);
      const { rows, count } = await Producto.findAndCountAll({
        include: [
          { model: Categoria, as: "categoria" },
          { model: Especie, as: "especie" },
          { model: TipoProducto, as: "tipo_producto" }
        ],
        order: [["id", "ASC"]],
        offset,
        limit: Number(limit)
      });

      return { rows, count, page: Number(page), limit: Number(limit) };
    } catch (error) {
      throw new Error("ProductoRepository.findAll: " + error.message);
    }
  }

  async findByFilters(filtros = {}, { page = 1, limit = 50 } = {}) {
    try {
      const where = {};
      if (filtros.id_categoria) where.id_categoria = filtros.id_categoria;
      if (filtros.id_especie) where.id_especie = filtros.id_especie;
      if (filtros.id_tipo_producto) where.id_tipo_producto = filtros.id_tipo_producto;

      const include = [
        { model: Categoria, as: "categoria", where: {}, required: false },
        { model: Especie, as: "especie", where: {}, required: false },
        { model: TipoProducto, as: "tipo_producto", where: {}, required: false }
      ];

      if (filtros.categoriaNombre) include[0].where.nombre = filtros.categoriaNombre;
      if (filtros.especieNombre) include[1].where.nombre = filtros.especieNombre;
      if (filtros.tipoNombre) include[2].where.nombre = filtros.tipoNombre;

      include.forEach((inc) => {
        if (!inc.where || Object.keys(inc.where).length === 0) delete inc.where;
      });

      const offset = (Number(page) - 1) * Number(limit);
      const { rows, count } = await Producto.findAndCountAll({
        where,
        include,
        order: [["id", "ASC"]],
        offset,
        limit: Number(limit)
      });

      return { rows, count, page: Number(page), limit: Number(limit) };
    } catch (error) {
      throw new Error("ProductoRepository.findByFilters: " + error.message);
    }
  }

  async updateImages(id, urls = []) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) return null;

      let existing = producto.URL_imagen;
      let images = [];

      try {
        images = existing ? JSON.parse(existing) : [];
        if (!Array.isArray(images)) images = [];
      } catch (e) {
        images = existing ? [String(existing)] : [];
      }

      images = images.concat(urls);

      producto.URL_imagen = JSON.stringify(images);
      await producto.save();

      return producto;
    } catch (error) {
      throw new Error("ProductoRepository.updateImages: " + error.message);
    }
  }
}

module.exports = new ProductoRepository();
