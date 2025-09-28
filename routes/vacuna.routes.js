const express = require("express");
const router = express.Router();
const VacunaController = require("../controllers/VacunaController");
const { authenticateToken, requireVeterinario } = require("../middlewares/auth");

// Rutas de consulta (accesibles para ambos tipos de usuario)
router.get("/", authenticateToken, VacunaController.getAll);
router.get("/:id", authenticateToken, VacunaController.getById);
router.get("/nombre/:nombre", authenticateToken, VacunaController.getByNombre);
router.get("/:id/mascotas", authenticateToken, VacunaController.getMascotasVacunadas);

// Rutas de escritura (solo para veterinarios)
router.post("/", authenticateToken, requireVeterinario, VacunaController.create);
router.put("/:id", authenticateToken, requireVeterinario, VacunaController.update);
router.delete("/:id", authenticateToken, requireVeterinario, VacunaController.delete);

module.exports = router;