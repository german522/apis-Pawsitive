const express = require("express");
const router = express.Router();
const MovimientoInventarioController = require("../controllers/MovimientoInventarioController");
const { authenticateToken, requireVeterinario } = require("../middlewares/auth");


router.get("/listado", authenticateToken, requireVeterinario, MovimientoInventarioController.obtenerMovimientos);
router.get("/:id", authenticateToken, requireVeterinario, MovimientoInventarioController.detalleMovimiento);

module.exports = router;
