const express = require("express");
const router = express.Router();
const ProductoController = require("../controllers/ProductoController");
const { authenticateToken, requireVeterinario } = require("../middlewares/auth");
const { uploadProducto } = require("../config/cloudinary");

// 4. Registrar producto (solo veterinario)
router.post("/registrar-producto", authenticateToken, requireVeterinario, ProductoController.crearProducto);

// 4.5 Subir imagen a un producto (solo veterinario)
router.post("/:id/subir-imagen-producto", authenticateToken, requireVeterinario, uploadProducto.single("imagen"), ProductoController.subirImagen);

// 5. Obtener productos generales (solo veterinario)
router.get("/obtener-productos-general", authenticateToken, requireVeterinario, ProductoController.obtenerGenerales);

// 6. Productos venta restringida (solo veterinario)
router.get("/obtener-restringidos", authenticateToken, requireVeterinario, ProductoController.obtenerRestringidos);

// 7. Productos venta libre (solo clientes)
router.get("/obtener-venta-libre", ProductoController.obtenerVentaLibre);

// 8. Detalle de un producto (ambos)
router.get("/:id/detalle", authenticateToken, ProductoController.obtenerDetalle);

// 9. Actualizar producto (solo veterinario)
router.put("/:id/actualizar-producto", authenticateToken, requireVeterinario, ProductoController.actualizarProducto);

// 10. Eliminar producto (solo veterinario)
router.delete("/:id/eliminar-producto", authenticateToken, requireVeterinario, ProductoController.eliminarProducto);

// 12. Obtener todos los movimientos del inventario (solo veterinario)
router.get("/movimientos/listado", authenticateToken, requireVeterinario, ProductoController.obtenerMovimientos);

// 13. Obtener detalle de un movimiento del inventario (solo veterinario)
router.get("/movimientos/:id", authenticateToken, requireVeterinario, ProductoController.obtenerMovimientoPorId);

// 14. Obtener productos bajos en stock (solo veterinario)
router.get("/alerta/bajo-stock", authenticateToken, requireVeterinario, ProductoController.obtenerBajoStock);

module.exports = router;
