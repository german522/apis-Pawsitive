const express = require("express");
const router = express.Router();
const ProductoController = require("../controllers/ProductoController");
const { authenticateToken } = require("../middlewares/auth");


router.get("/libres", ProductoController.obtenerProductosLibres);

router.post("/registrar-producto", authenticateToken, ProductoController.crearProducto);
router.post("/:id/registrar-imagen-producto", authenticateToken, ProductoController.adjuntarImagenes);
router.get("/productos-restringidos", authenticateToken, ProductoController.obtenerProductosRestringidos);
router.get("/obtener-productos", authenticateToken, ProductoController.obtenerProductos);
router.get("/:id/obtener-detalle", authenticateToken, ProductoController.obtenerDetalle);
router.put("/:id/actualizar-producto", authenticateToken, ProductoController.actualizarProducto);
router.delete("/:id/eliminar-producto", authenticateToken, ProductoController.eliminarProducto);

module.exports = router;