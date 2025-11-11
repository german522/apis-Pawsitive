const express = require("express");
const router = express.Router();
const ServiciosController = require("../controllers/serviciosController");
const { authenticateToken } = require("../middlewares/auth");

// Rutas protegidas (requieren autenticación)
router.get("/", authenticateToken, ServiciosController.getAll);
router.get("/:id", authenticateToken, ServiciosController.getById);
router.post("/", authenticateToken, ServiciosController.create);
router.put("/:id", authenticateToken, ServiciosController.update);
router.delete("/:id", authenticateToken, ServiciosController.delete);

// Filtros específicos
router.get("/cliente/:id_cliente", authenticateToken, ServiciosController.getByCliente);
router.get("/mascota/:id_mascota", authenticateToken, ServiciosController.getByMascota);
router.get("/estado/:estado", authenticateToken, ServiciosController.getByEstado);

// Cambiar estado del servicio
router.put("/:id/estado", authenticateToken, ServiciosController.updateEstado);

// Asignar veterinario
router.put("/:id/asignar-veterinario", authenticateToken, ServiciosController.assignVeterinario);

module.exports = router;
