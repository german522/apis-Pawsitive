const ProductoRepository = require("../repositories/ProductoRepository");
const ApiResponse = require("../utils/ApiResponse");

const ProductoController = {
  crearProducto: async (req, res) => {
    if (req.user.tipo !== "veterinario") {
        return ApiResponse.error("Solo veterinarios pueden crear productos", res, 403);
    }
    try {
      const {
        id_categoria,
        id_especie,
        id_tipo_producto,
        nombre,
        descripcion,
        precio,
        presentacion,
        unidad_medida,
        fecha_caducidad,
        requiere_receta
      } = req.body;

      if (!id_categoria || !nombre || !precio) {
        return ApiResponse.validation(
          "Faltan campos obligatorios: id_categoria, nombre, precio.",
          null,
          res
        );
      }

      const payload = {
        id_categoria,
        id_especie: id_especie || null,
        id_tipo_producto: id_tipo_producto || null,
        nombre,
        descripcion: descripcion || null,
        precio,
        presentacion: presentacion || null,
        unidad_medida: unidad_medida || null,
        fecha_caducidad: fecha_caducidad || null,
        requiere_receta: requiere_receta === "true" || requiere_receta === true ? true : false
      };
      const nuevo = await ProductoRepository.create(payload);

      return ApiResponse.success("Producto creado correctamente.", nuevo, res);
    } catch (error) {
      console.error("crearProducto error:", error);
      return ApiResponse.error("Error creando producto.", res, 500, error.message);
    }
  },

  adjuntarImagenes: async (req, res) => {
  if (req.user.tipo !== "veterinario") {
    return ApiResponse.error("Solo veterinarios pueden adjuntar imágenes", res, 403);
  }
    try {
      const { id } = req.params;

      const urls = [];
      if (req.files && Array.isArray(req.files)) {
        for (const f of req.files) {
          const url = f.secure_url || f.url || f.path || f.location;
          if (url) urls.push(url);
        }
      } else if (req.file) {
        const f = req.file;
        const url = f.secure_url || f.url || f.path || f.location;
        if (url) urls.push(url);
      } else if (req.body && req.body.imagenUrls) {
        const parsed = typeof req.body.imagenUrls === "string" ? JSON.parse(req.body.imagenUrls) : req.body.imagenUrls;
        if (Array.isArray(parsed)) parsed.forEach(u => urls.push(u));
      }

      if (urls.length === 0) {
        return ApiResponse.validation("No se encontraron imágenes para adjuntar.", null, res);
      }

      const productoActualizado = await ProductoRepository.updateImages(id, urls);
      if (!productoActualizado) return ApiResponse.notFound("Producto no encontrado.", null, res);

      return ApiResponse.success("Imágenes adjuntadas correctamente.", productoActualizado, res);
    } catch (error) {
      console.error("adjuntarImagenes error:", error);
      return ApiResponse.error("Error adjuntando imágenes.", res, 500, error.message);
    }
  },

  obtenerProductos: async (req, res) => {
    if (req.user.tipo !== "veterinario") {
    return ApiResponse.error("Solo veterinarios pueden observar todos los productos", res, 403);
  }
    try {
      const { page, limit } = req.query;
      const data = await ProductoRepository.findAll({ page, limit });

      return ApiResponse.success("Productos obtenidos.", data, res);
    } catch (error) {
      console.error("obtenerProductos error:", error);
      return ApiResponse.error("Error obteniendo productos.", res, 500, error.message);
    }
  },

  obtenerProductosRestringidos: async (req, res) => {
  if (req.user.tipo !== "veterinario") {
    return ApiResponse.error("Solo veterinarios pueden ver productos restringidos", res, 403);
  }
    try {
      const { id_categoria, id_especie, id_tipo_producto, categoriaNombre, especieNombre, tipoNombre, page, limit } = req.query;

      const filtros = {
        id_categoria,
        id_especie,
        id_tipo_producto,
        categoriaNombre,
        especieNombre,
        tipoNombre
      };

      const result = await ProductoRepository.findByFilters(filtros, { page, limit });

      const rows = result.rows.filter(p => p.requiere_receta === true);

      return ApiResponse.success("Productos restringidos obtenidos.", { ...result, rows }, res);
    } catch (error) {
      console.error("obtenerProductosRestringidos error:", error);
      return ApiResponse.error("Error obteniendo productos restringidos.", res, 500, error.message);
    }
  },

  obtenerProductosLibres: async (req, res) => {
    try {
      const { id_categoria, id_especie, id_tipo_producto, categoriaNombre, especieNombre, tipoNombre, page, limit } = req.query;

      const filtros = {
        id_categoria,
        id_especie,
        id_tipo_producto,
        categoriaNombre,
        especieNombre,
        tipoNombre
      };

      const result = await ProductoRepository.findByFilters(filtros, { page, limit });

      const rows = result.rows.filter(p => p.requiere_receta === false);

      return ApiResponse.success("Productos de venta libre obtenidos.", { ...result, rows }, res);
    } catch (error) {
      console.error("obtenerProductosLibres error:", error);
      return ApiResponse.error("Error obteniendo productos de venta libre.", res, 500, error.message);
    }
  },

  obtenerDetalle: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await ProductoRepository.findById(id);
      if (!producto) return ApiResponse.notFound("Producto no encontrado.", null, res);

      const p = producto.toJSON();
      try {
        p.URL_imagen = p.URL_imagen ? JSON.parse(p.URL_imagen) : [];
      } catch (e) {
        p.URL_imagen = p.URL_imagen ? [p.URL_imagen] : [];
      }

      return ApiResponse.success("Detalle de producto obtenido.", p, res);
    } catch (error) {
      console.error("obtenerDetalle error:", error);
      return ApiResponse.error("Error obteniendo detalle de producto.", res, 500, error.message);
    }
  },

    actualizarProducto: async (req, res) => {
    if (req.user.tipo !== "veterinario") {
        return ApiResponse.error("Solo veterinarios pueden actualizar productos", res, 403);
    }
    try {
      const { id } = req.params;
      const payload = { ...req.body };

      if ("stock_actual" in payload) delete payload.stock_actual;

      const updated = await ProductoRepository.updateById(id, payload);
      if (!updated) return ApiResponse.notFound("Producto no encontrado o no actualizado.", null, res);

      return ApiResponse.success("Producto actualizado correctamente.", null, res);
    } catch (error) {
      console.error("actualizarProducto error:", error);
      return ApiResponse.error("Error actualizando producto.", res, 500, error.message);
    }
  },

    eliminarProducto: async (req, res) => {
    if (req.user.tipo !== "veterinario") {
        return ApiResponse.error("Solo veterinarios pueden eliminar productos", res, 403);
    }
    try {
      const { id } = req.params;
      const updated = await ProductoRepository.softDeleteById(id);
      if (!updated) return ApiResponse.notFound("Producto no encontrado o ya inactivo.", null, res);

      return ApiResponse.success("Producto marcado como inactivo (eliminado).", null, res);
    } catch (error) {
      console.error("eliminarProducto error:", error);
      return ApiResponse.error("Error eliminando producto.", res, 500, error.message);
    }
  }
};

module.exports = ProductoController;
