// cita.routes.js (Mejorado)
const express = require('express');
const router = express.Router();
const CitaController = require('../controllers/CitaController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', CitaController.listarCitas);
router.post('/agendar', CitaController.agendarCita); 
router.put('/:id/cancelar', CitaController.cancelarCita);
router.get('/disponibles', CitaController.horariosDisponibles); 

module.exports = router;