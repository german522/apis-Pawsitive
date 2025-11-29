const express = require("express");
const router = express.Router();
const CarritoController = require("../controllers/CarritoController");
const { authenticateToken } = require("../middlewares/auth");

router.post("/", authenticateToken, CarritoController.crearCarrito);

router.get("/activo", authenticateToken, CarritoController.obtenerCarritoActivo);

router.post("/item", authenticateToken, CarritoController.agregarProducto);

router.put("/item", authenticateToken, CarritoController.actualizarCantidad);

router.delete("/item/:id_producto", authenticateToken, CarritoController.eliminarProducto);

router.get("/resumen", authenticateToken, CarritoController.obtenerResumenCarrito);

router.post("/cerrar", authenticateToken, CarritoController.cerrarCarrito);

module.exports = router;
