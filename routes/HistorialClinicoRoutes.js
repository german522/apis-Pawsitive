const express = require("express");
const router = express.Router();
const HistorialClinicoController = require("../controllers/HistorialClinicoController");
const { authenticateToken, requireCliente } = require("../middlewares/auth");

router.get("/:id", authenticateToken, requireCliente, HistorialClinicoController.obtenerExpedientePorMascota);

module.exports = router;
