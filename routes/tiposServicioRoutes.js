const express = require("express");
const router = express.Router();
const tiposServicioController = require("../controllers/tiposServicioController");

// GET /api/tipos-servicio - Obtener todos los tipos de servicio
router.get("/", tiposServicioController.getAll);

// GET /api/tipos-servicio/:id - Obtener un tipo de servicio por ID
router.get("/:id", tiposServicioController.getById);

// POST /api/tipos-servicio - Crear un nuevo tipo de servicio
router.post("/", tiposServicioController.create);

// PUT /api/tipos-servicio/:id - Actualizar un tipo de servicio
router.put("/:id", tiposServicioController.update);

// DELETE /api/tipos-servicio/:id - Eliminar un tipo de servicio
router.delete("/:id", tiposServicioController.delete);

module.exports = router;
