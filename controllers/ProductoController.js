const ProductoRepository = require("../repositories/ProductoRepository");
const MovimientoRepository = require("../repositories/MovimientoInventarioRepository");
const ApiResponse = require("../utils/ApiResponse");

const ProductoController = {

    // 4. Crear producto
    crearProducto: async (req, res) => {
  try {
    const idResponsable = req.user?.tipoId; // viene del JWT

    if (!idResponsable) {
      return ApiResponse.error("Falta idResponsable", res, 400);
    }

    const producto = await ProductoRepository.crearProducto(req.body, idResponsable);

    return ApiResponse.success("Producto creado correctamente", producto, res, 201);
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Error al crear producto", res);
  }
},


    // 4.5 Subir imagen
    subirImagen: async (req, res) => {
        try {
            const productoId = req.params.id;

            if (!req.file || !req.file.path) {
                return ApiResponse.validation("No se recibió la imagen", null, res);
            }

            const url_imagen = req.file.path;

            const actualizado = await ProductoRepository.update(productoId, { url_imagen });

            return ApiResponse.success("Imagen subida correctamente", { url_imagen }, res);
        } catch (error) {
            return ApiResponse.error("Error al subir imagen", res, 500, error);
        }
    },

    // 5. Productos generales
    obtenerGenerales: async (req, res) => {
        try {
            const productos = await ProductoRepository.findAll();
            return ApiResponse.success("Productos obtenidos correctamente", productos, res);
        } catch (error) {
            return ApiResponse.error("Error al obtener productos", res, 500, error);
        }
    },

    // 6. Venta restringida
    obtenerRestringidos: async (req, res) => {
        try {
            const filtros = req.query;
            const productos = await ProductoRepository.obtenerRestringidos(filtros);
            return ApiResponse.success("Productos restringidos obtenidos", productos, res);
        } catch (error) {
            return ApiResponse.error("Error al obtener productos restringidos", res, 500, error);
        }
    },

    // 7. Venta libre (solo clientes)
    obtenerVentaLibre: async (req, res) => {
        try {
            const filtros = req.query;
            const productos = await ProductoRepository.obtenerLibres(filtros);
            return ApiResponse.success("Productos de venta libre obtenidos", productos, res);
        } catch (error) {
            return ApiResponse.error("Error al obtener productos de venta libre", res, 500, error);
        }
    },

    // 8. Detalle
    obtenerDetalle: async (req, res) => {
        try {
            const id = req.params.id;
            const producto = await ProductoRepository.findById(id);

            if (!producto) {
                return ApiResponse.notFound("Producto no encontrado", res);
            }

            return ApiResponse.success("Detalle del producto obtenido", producto, res);
        } catch (error) {
            return ApiResponse.error("Error al obtener detalle del producto", res, 500, error);
        }
    },

    // 9. Actualizar producto
    actualizarProducto: async (req, res) => {
        try {
            const id = req.params.id;
            const actualizado = await ProductoRepository.update(id, req.body);

            await MovimientoRepository.registrar({
                id_producto: id,
                tipo_movimiento: "ACTUALIZACIÓN",
                descripcion: "Producto actualizado",
                cantidad: req.body.stock ?? null
            });

            return ApiResponse.success("Producto actualizado correctamente", actualizado, res);
        } catch (error) {
            return ApiResponse.error("Error al actualizar producto", res, 500, error);
        }
    },

    // 10. Eliminar producto
    eliminarProducto: async (req, res) => {
        try {
            const id = req.params.id;

            await ProductoRepository.delete(id);

            await MovimientoRepository.registrar({
                id_producto: id,
                tipo_movimiento: "ELIMINACIÓN",
                descripcion: "Producto eliminado",
                cantidad: 0
            });

            return ApiResponse.success("Producto eliminado correctamente", null, res);
        } catch (error) {
            return ApiResponse.error("Error al eliminar producto", res, 500, error);
        }
    },

    // 12. Listado de movimientos
    obtenerMovimientos: async (req, res) => {
        try {
            const mov = await MovimientoRepository.findAll();
            return ApiResponse.success("Movimientos obtenidos correctamente", mov, res);
        } catch (error) {
            return ApiResponse.error("Error al obtener movimientos", res, 500, error);
        }
    },

    // 13. Movimiento por ID
    obtenerMovimientoPorId: async (req, res) => {
        try {
            const mov = await MovimientoRepository.findById(req.params.id);

            if (!mov) {
                return ApiResponse.notFound("Movimiento no encontrado", res);
            }

            return ApiResponse.success("Movimiento obtenido correctamente", mov, res);
        } catch (error) {
            return ApiResponse.error("Error al obtener movimiento", res, 500, error);
        }
    },

    // 14. Productos bajos en stock
    obtenerBajoStock: async (req, res) => {
        try {
            const productos = await ProductoRepository.obtenerBajoStock();
            return ApiResponse.success("Productos con bajo stock obtenidos", productos, res);
        } catch (error) {
            return ApiResponse.error("Error al obtener productos bajos en stock", res, 500, error);
        }
    },
};

module.exports = ProductoController;
