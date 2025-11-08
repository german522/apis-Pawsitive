const express = require('express');
const router = express.Router();
const CirugiaController = require('../controllers/CirugiaController');
const { authenticateToken } = require("../middlewares/auth");

router.post('/registrar-cirugia', authenticateToken, CirugiaController.registrarCirugia);
router.get('/mis-cirugias', authenticateToken, CirugiaController.listarCirugiasTotales);
router.get('/cirugia-mascota/:id_mascota', authenticateToken, CirugiaController.listarCirugiasPorMascota);
router.put('/actualizar-estado-cirugia/:id', authenticateToken, CirugiaController.actualizarEstadoCirugia);
router.get('/obtener-cirugia/:id', authenticateToken, CirugiaController.obtenerCirugiaPorId);
router.put('/actualizar-horas-cirugia/:id', authenticateToken, CirugiaController.actualizarHorasCirugia);

module.exports = router;
