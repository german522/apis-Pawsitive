const express = require("express");
const router = express.Router();
const VacunaxMascotaController = require("../controllers/VacunaxMascotaController");
const { authenticateToken, requireVeterinario } = require("../middlewares/auth");

// Rutas de consulta generales (solo para veterinarios)
router.get("/", authenticateToken, requireVeterinario, VacunaxMascotaController.getAll);

// Rutas accesibles para ambos tipos (con validaciones internas de permisos)
router.get("/:id", authenticateToken, VacunaxMascotaController.getById);
router.put("/:id", authenticateToken, VacunaxMascotaController.update);
router.delete("/:id", authenticateToken, VacunaxMascotaController.delete);

// Aplicar vacuna (ambos tipos pueden hacerlo)
router.post("/", authenticateToken, VacunaxMascotaController.aplicarVacuna);

// Consultas por mascota y vacuna
router.get("/mascota/:id_mascota", authenticateToken, VacunaxMascotaController.getByMascotaId);
router.get("/vacuna/:id_vacuna", authenticateToken, VacunaxMascotaController.getByVacunaId);

// Historial completo de una mascota
router.get("/mascota/:id_mascota/historial", authenticateToken, VacunaxMascotaController.getHistorialCompleto);

module.exports = router;