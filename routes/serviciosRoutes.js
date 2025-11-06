const express = require("express");
const router = express.Router();
const serviciosController = require("../controllers/serviciosController");

// GET /api/servicios - Obtener todos los servicios
router.get("/", serviciosController.getAll);

// GET /api/servicios/:id - Obtener un servicio por ID
router.get("/:id", serviciosController.getById);

// POST /api/servicios - Crear un nuevo servicio
router.post("/", serviciosController.create);

// PUT /api/servicios/:id - Actualizar un servicio
router.put("/:id", serviciosController.update);

// DELETE /api/servicios/:id - Eliminar un servicio
router.delete("/:id", serviciosController.delete);

// GET /api/servicios/cliente/:id_cliente - Obtener servicios por cliente
router.get("/cliente/:id_cliente", serviciosController.getByCliente);

// GET /api/servicios/mascota/:id_mascota - Obtener servicios por mascota
router.get("/mascota/:id_mascota", serviciosController.getByMascota);

// GET /api/servicios/estado/:estado - Obtener servicios por estado
router.get("/estado/:estado", serviciosController.getByEstado);

// PATCH /api/servicios/:id/estado - Actualizar estado del servicio
router.patch("/:id/estado", serviciosController.updateEstado);

// PATCH /api/servicios/:id/asignar-veterinario - Asignar veterinario al servicio
router.patch("/:id/asignar-veterinario", serviciosController.assignVeterinario);

module.exports = router;
