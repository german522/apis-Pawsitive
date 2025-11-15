const express = require('express');
const router = express.Router();
const EstadisticasController = require('../controllers/EstadisticasController');

router.get('/totales-cv', EstadisticasController.obtenerTotales);


module.exports = router;
