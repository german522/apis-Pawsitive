const express = require("express");
const router = express.Router();
const expedienteMascotaController = require("../controllers/HistorialClinicoController");
const { authenticateToken } = require("../middlewares/auth");

// /api/mascotas/:id/expediente
router.get(
  "/mascotas/:id/expediente",
  authenticateToken,
  expedienteMascotaController.obtenerExpedientePorMascota
);

module.exports = router;
