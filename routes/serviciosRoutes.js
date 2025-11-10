const express = require("express");
const router = express.Router();
const serviciosController = require("../controllers/serviciosController");
const {
  authenticateToken,
  requireCliente,
  requireVeterinario,
} = require("../middlewares/auth");

// ======================================================
// Rutas accesibles para ambos tipos de usuario
// ======================================================
router.get("/", authenticateToken, serviciosController.getAll);
router.get("/:id", authenticateToken, serviciosController.getById);
router.get(
  "/cliente/:id_cliente",
  authenticateToken,
  serviciosController.getByCliente
);
router.get(
  "/mascota/:id_mascota",
  authenticateToken,
  serviciosController.getByMascota
);
router.get(
  "/estado/:estado",
  authenticateToken,
  serviciosController.getByEstado
);

// ======================================================
// Rutas específicas para clientes
// ======================================================
router.post("/", authenticateToken, requireCliente, serviciosController.create);
router.put(
  "/:id",
  authenticateToken,
  requireCliente,
  serviciosController.update
);
router.delete(
  "/:id",
  authenticateToken,
  requireCliente,
  serviciosController.delete
);

// ======================================================
// Rutas específicas para veterinarios
// ======================================================
router.patch(
  "/:id/estado",
  authenticateToken,
  requireVeterinario,
  serviciosController.updateEstado
);
router.patch(
  "/:id/asignar-veterinario",
  authenticateToken,
  requireVeterinario,
  serviciosController.assignVeterinario
);

module.exports = router;
