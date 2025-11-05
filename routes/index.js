const express = require("express");
const router = express.Router();

// Importar todas las rutas
const authRoutes = require("./auth.routes");
const clienteRoutes = require("./cliente.routes");
const veterinarioRoutes = require("./veterinario.routes");
const mascotaRoutes = require("./mascota.routes");
const vacunaRoutes = require("./vacuna.routes");
const vacunacionRoutes = require("./vacunacion.routes");
const citaRoutes = require("./cita.routes");
const tiposServicioRoutes = require("./tiposServicioRoutes");
const serviciosRoutes = require("./serviciosRoutes");
const expedienteRoutes = require("./expedientes.routes");
const consultaRoutes = require("./consulta.routes");

// Usar las rutas con sus prefijos
router.use("/auth", authRoutes);
router.use("/clientes", clienteRoutes);
router.use("/veterinarios", veterinarioRoutes);
router.use("/mascotas", mascotaRoutes);
router.use("/vacunas", vacunaRoutes);
router.use("/vacunaciones", vacunacionRoutes);
router.use("/citas", citaRoutes);
router.use("/tipos-servicio", tiposServicioRoutes);
router.use("/servicios", serviciosRoutes);
router.use("/expedientes", expedienteRoutes);
router.use("/consultas", consultaRoutes);

// Ruta de salud de la API
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Pawsitive funcionando correctamente",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Ruta de información de la API
router.get("/info", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Pawsitive - Sistema Veterinario",
    data: {
      version: "1.0.0",
      description:
        "API REST para gestión de clientes, veterinarios, mascotas y vacunación",
      endpoints: {
        auth: "/api/auth",
        clientes: "/api/clientes",
        veterinarios: "/api/veterinarios",
        mascotas: "/api/mascotas",
        vacunas: "/api/vacunas",
        vacunaciones: "/api/vacunaciones",
      },
    },
  });
});

module.exports = router;
