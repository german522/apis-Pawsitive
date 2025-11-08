const express = require("express");
const router = express.Router();
const VacunaxMascotaController = require("../controllers/VacunaxMascotaController");
const { authenticateToken, requireVeterinario } = require("../middlewares/auth");

// 1️⃣ Añadir vacuna a una mascota por su id (solo veterinarios)
router.post("/:id_mascota/vacunas", authenticateToken, requireVeterinario, VacunaxMascotaController.aplicarVacuna);

// 2️⃣ Actualizar vacuna aplicada a una mascota (solo veterinarios)
router.put("/:id_mascota/vacunas/:id_vacunacion", authenticateToken, requireVeterinario, VacunaxMascotaController.updateVacunaMascota);

// 3️⃣ Eliminar vacuna aplicada a una mascota (solo veterinarios)
router.delete("/:id_mascota/vacunas/:id_vacunacion", authenticateToken, requireVeterinario, VacunaxMascotaController.deleteVacunaMascota);

// 4️⃣ Obtener todas las vacunas aplicadas a una mascota (usuarios y veterinarios)
router.get("/:id_mascota/vacunas", authenticateToken, VacunaxMascotaController.getVacunasByMascotaId);

// 5️⃣ Obtener detalle de una vacuna aplicada a una mascota (usuarios y veterinarios)
router.get("/:id_mascota/vacunas/:id_vacunacion", authenticateToken, VacunaxMascotaController.getDetalleVacunaMascota);

module.exports = router;
