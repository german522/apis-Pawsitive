const express = require("express");
const router = express.Router();
const MascotaController = require("../controllers/MascotaController");
const { authenticateToken, requireCliente, requireVeterinario } = require("../middlewares/auth");
const { uploadMascota } = require("../config/cloudinary");

// Rutas accesibles para veterinarios (pueden ver todas las mascotas)
router.get("/", authenticateToken, requireVeterinario, MascotaController.getAll);

// Rutas accesibles para ambos tipos de usuario
router.get("/:id", authenticateToken, MascotaController.getById);
router.put("/:id", authenticateToken, MascotaController.update);
router.delete("/:id", authenticateToken, MascotaController.delete);

// Rutas específicas para clientes
router.post("/", authenticateToken, requireCliente, MascotaController.create);
router.get("/mis-mascotas/cliente", authenticateToken, requireCliente, MascotaController.getMascotasCliente);

// Rutas de consulta por especie (para ambos tipos)
router.get("/especie/:especie", authenticateToken, MascotaController.getByEspecie);

// Rutas para historial de vacunas
router.get("/:id/vacunas", authenticateToken, MascotaController.getHistorialVacunas);

router.post("/:id/subir-imagen", authenticateToken, uploadMascota.single('imagen'), MascotaController.subirImagen);

module.exports = router;