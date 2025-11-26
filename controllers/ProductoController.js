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
    //4.5 subir imagen del producto
    subirImagen: async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file || !req.file.path) {
      return ApiResponse.validation("No se envió ninguna imagen", null, res);
    }

    const resultado = await ProductoRepository.adjuntarImagen(id, req.file.path);

    if (!resultado) {
      return ApiResponse.notFound("Producto no encontrado", res);
    }

    return ApiResponse.success("Imagen subida correctamente", resultado, res);
  } catch (error) {
    console.error("ERROR SUBIR IMAGEN:", error);
    return ApiResponse.error("Error al subir imagen", res, 500, error);
  }
},

// 5. Productos generales
    obtenerProductos: async (req, res) => {
  try {
    const productos = await ProductoRepository.obtenerProductos();

    return ApiResponse.success("Productos obtenidos correctamente", productos, res);
  } catch (error) {
    console.error("ERROR OBTENER PRODUCTOS:", error);
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
            const producto = await ProductoRepository.obtenerPorId(id);

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
            const id = req.params.id;               // ID del producto
            const idVeterinario = req.user.tipoId;  // ID del veterinario (FK correcta)

            const actualizado = await ProductoRepository.actualizarProducto(
                id,
                req.body,
                idVeterinario
            );

            return ApiResponse.success("Producto actualizado correctamente", actualizado, res);
        } catch (error) {
            return ApiResponse.error("Error al actualizar producto", res, 500, error);
        }
    },

    // 10. Eliminar producto
    eliminarProducto: async (req, res) => {
    try {
        const id = req.params.id;
        const idVeterinario = req.user.tipoId;

        // 1. Eliminar producto (tu repo registrará movimiento principal si lo tienes así)
        await ProductoRepository.eliminarProducto(id, idVeterinario);

        // 2. Registrar movimiento general (si de verdad quieres también este)
        await MovimientoRepository.crearMovimiento({
            id_producto: id,
            id_responsable: idVeterinario,
            tipo_movimiento: "ELIMINACIÓN",
            descripcion: "Producto eliminado",
            cantidad: 0
        });

        return ApiResponse.success(
            "Producto eliminado correctamente",
            null,
            res
        );

    } catch (error) {
        return ApiResponse.error(
            "Error al eliminar producto",
            res,
            500,
            error
        );
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
