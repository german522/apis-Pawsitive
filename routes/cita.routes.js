// cita.routes.js (Mejorado)
const express = require('express');
const router = express.Router();

const CitaController = require('../controllers/CitaController');
const { authenticateToken } = require('../middlewares/auth');

// Todas las rutas requieren autenticación. Esta línea es suficiente.
router.use(authenticateToken);

// Endpoints de citas
router.get('/', CitaController.listarCitas);
router.post('/agendar', CitaController.agendarCita); // Eliminado authenticateToken
router.put('/:id/cancelar', CitaController.cancelarCita);
router.get('/disponibles', CitaController.horariosDisponibles); // Eliminado authenticateToken

module.exports = router;