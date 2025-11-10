const express = require("express");
const router = express.Router();
const expedienteMascotaController = require("../controllers/HistorialClinicoController");

// GET /api/mascotas/:id/expediente
router.get(
  "/mascotas/:id/expediente",
  expedienteMascotaController.obtenerExpedientePorMascota
);

module.exports = router;
