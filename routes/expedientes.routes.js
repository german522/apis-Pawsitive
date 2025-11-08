const express = require("express");
const router = express.Router();
const ExpedienteController = require("../controllers/ExpedienteController");
const { authenticateToken, requireVeterinario } = require("../middlewares/auth");


// ✅ Crear expediente
router.post('/', ExpedienteController.crearExpediente);

// ✅ Obtener todos los expedientes
router.get('/', ExpedienteController.obtenerExpedientes);

// ✅ Obtener expediente por ID
router.get('/:id', ExpedienteController.obtenerExpedientePorId);

// ✅ Obtener expediente por ID de mascota
router.get('/mascota/:id_mascota', ExpedienteController.obtenerExpedientePorMascota);

// ✅ Actualizar expediente
router.put('/:id', ExpedienteController.actualizarExpediente);

// ✅ Eliminar expediente
router.delete('/:id', ExpedienteController.eliminarExpediente);

module.exports = router;