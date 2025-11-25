const ProductoRepository = require("../repositories/ProductoRepository");

const ProductoController = {
  // 4. POST /productos
  crearProducto: async (req, res) => {
    try {
      const idVeterinario = req.usuario.id; 
      const {
        id_categoria,
        id_especie,
        id_tipo_producto,
        nombre,
        descripcion,
        precio,
        stock_inicial = 0,
        presentacion,
        unidad_medida,
        fecha_caducidad,
        requiere_receta = false
      } = req.body;

      const dataProducto = {
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
      };

      const nuevo = await ProductoRepository.crearProducto(dataProducto, Number(stock_inicial), idVeterinario);
      return res.status(201).json(nuevo);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message || "Error al crear producto" });
    }
  },

  // 4.5 POST /productos/:id/imagenes (single image)
  adjuntarImagen: async (req, res) => {
    try {
      const idProducto = req.params.id;
      const idVeterinario = req.usuario.id;

      // multer + cloudinary deben poner la url en req.file.path o req.file.secure_url o req.file.path
      if (!req.file) return res.status(400).json({ message: "No se envió imagen" });

      // Ajusta según cómo tu middleware coloque la URL. Aquí se asume req.file.path es la URL (CloudinaryStorage suele usar path)
      const url = req.file.path || req.file.secure_url || req.file.url || (req.file && req.file.location);

      const producto = await ProductoRepository.adjuntarImagen(idProducto, url, idVeterinario);
      return res.status(200).json(producto);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message || "Error al adjuntar imagen" });
    }
  },

  // 5. GET /productos  (veterinario: obtiene generales)
  obtenerProductos: async (req, res) => {
    try {
      const filtros = {
        categoria: req.query.categoria,
        especie: req.query.especie,
        tipo_producto: req.query.tipo_producto,
        estado: req.query.estado
      };
      const productos = await ProductoRepository.obtenerProductos({ filtros });
      return res.json(productos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al obtener productos" });
    }
  },

  // 6. GET /productos/restringidos  (veterinarios)
  obtenerRestringidos: async (req, res) => {
    try {
      const filtros = {
        categoria: req.query.categoria,
        especie: req.query.especie,
        tipo_producto: req.query.tipo_producto
      };
      const productos = await ProductoRepository.obtenerRestringidos({ filtros });
      return res.json(productos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al obtener productos restringidos" });
    }
  },

  // 7. GET /productos/libres (clientes)
  obtenerLibres: async (req, res) => {
    try {
      const filtros = {
        id_categoria: req.query.categoria,
        id_especie: req.query.especie,
        id_tipo_producto: req.query.tipo_producto
      };

      // Map query names to what ProductoRepository espera (simple)
      const productos = await ProductoRepository.obtenerLibres({
        filtros: {
          id_categoria: req.query.categoria,
          id_especie: req.query.especie,
          id_tipo_producto: req.query.tipo_producto
        }
      });

      return res.json(productos);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al obtener productos libres" });
    }
  },

  // 8. GET /productos/:id
  detalleProducto: async (req, res) => {
    try {
      const producto = await ProductoRepository.obtenerPorId(req.params.id);
      if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
      return res.json(producto);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al obtener detalle" });
    }
  },

  // 9. PUT /productos/:id
  actualizarProducto: async (req, res) => {
    try {
      const idVeterinario = req.usuario.id;
      const cambios = req.body;
      const actualizado = await ProductoRepository.actualizarProducto(req.params.id, cambios, idVeterinario);
      return res.json(actualizado);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message || "Error al actualizar producto" });
    }
  },

  // 10. DELETE /productos/:id
  eliminarProducto: async (req, res) => {
    try {
      const idVeterinario = req.usuario.id;
      const eliminado = await ProductoRepository.eliminarProducto(req.params.id, idVeterinario);
      return res.json({ message: "Producto inactivado", producto: eliminado });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message || "Error al eliminar producto" });
    }
  },

  // 14. GET /productos/stock-bajo
  productosStockBajo: async (req, res) => {
    try {
      const umbral = req.query.umbral ? Number(req.query.umbral) : 5;
      const lista = await ProductoRepository.obtenerStockBajo({ umbral });
      // opcional: notificar
      // if (lista.length > 0) NotificationService.sendLowStockAlert(lista)
      return res.json(lista);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al consultar stock bajo" });
    }
  }
};

module.exports = ProductoController;
