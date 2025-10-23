const express = require('express');
const router = express.Router();

const CitaController = require('../controllers/CitaController');
const { authenticateToken } = require('../middlewares/auth'); // <-- aquí el nombre correcto

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Endpoints de citas
router.get('/', CitaController.listarCitas);
router.post('/agendar', authenticateToken, CitaController.agendarCita);
router.put('/:id/cancelar', CitaController.cancelarCita);
router.get('/disponibles', authenticateToken, CitaController.horariosDisponibles);

module.exports = router;
