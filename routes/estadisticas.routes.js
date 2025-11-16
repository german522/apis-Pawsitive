const express = require('express');
const router = express.Router();
const EstadisticasController = require('../controllers/EstadisticasController');
const { authenticateToken } = require("../middlewares/auth");

router.get('/totales-cv', EstadisticasController.obtenerTotales);
router.get("/servicios/semana", EstadisticasController.serviciosPorSemana);
router.get("/consultas-general/semana", EstadisticasController.consultasPorSemana);
router.get("/consultas-veterinario/semana/:id_veterinario", authenticateToken, EstadisticasController.consultasPorSemanaPorVet);
router.get("/vacunas-general/semana", EstadisticasController.vacunasPorSemana);
router.get("/vacunas-veterinario/semana/:id_veterinario", authenticateToken, EstadisticasController.vacunasPorSemanaPorVet);
router.get("/ganancias-consultas/semana/:id_veterinario", authenticateToken, EstadisticasController.gananciasConsultasPorSemana);
router.get("/ganancias-servicios/semana/:id_veterinario", authenticateToken, EstadisticasController.gananciasServiciosPorSemana);
router.get("/ganancias-totales/:id_veterinario", authenticateToken, EstadisticasController.gananciasTotales);
router.get("/tipos-servicios", EstadisticasController.cantidadPorTipoServicio);
router.get("/tipos-servicios/semana", EstadisticasController.cantidadPorTipoServicioPorSemana);
router.get("/tipos-servicios-veterinario/semana/:id_veterinario", authenticateToken, EstadisticasController.cantidadPorTipoServicioPorVetYSemana);

module.exports = router;
