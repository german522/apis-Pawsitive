const express = require("express");
const router = express.Router();
const TiposServiciosController = require("../controllers/tiposServicioController");

// Rutas públicas
router.get("/", TiposServiciosController.getAll);
router.put("/:id", TiposServiciosController.updateCosto);
router.delete("/:id", TiposServiciosController.delete);

module.exports = router;
