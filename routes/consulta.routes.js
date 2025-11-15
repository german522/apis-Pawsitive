const express = require('express');
const router = express.Router();
const ConsultaController = require('../controllers/ConsultaController');
const { authenticateToken } = require("../middlewares/auth");

router.post('/crear-consulta', authenticateToken, ConsultaController.crearConsulta);
router.get('/mis-consultas', authenticateToken, ConsultaController.listarConsultasPorUsuario);
router.get('/obtener/:id', authenticateToken, ConsultaController.obtenerConsultaPorId);
router.get('/por-mascota/:id_mascota', authenticateToken, ConsultaController.obtenerConsultasPorMascota);

module.exports = router;
