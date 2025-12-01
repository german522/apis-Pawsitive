const express = require("express");
const router = express.Router();
const VeterinarioController = require("../controllers/VeterinarioController");
const { authenticateToken, requireVeterinario } = require("../middlewares/auth");
const { validateRegisterVeterinario } = require("../middlewares/validation");
const { uploadPersona } = require("../config/cloudinary");

// Rutas públicas
router.post("/register", validateRegisterVeterinario, VeterinarioController.register);

// Rutas protegidas (solo para veterinarios autenticados)
router.post("/logout", authenticateToken, requireVeterinario, VeterinarioController.logout);
router.get("/profile", authenticateToken, requireVeterinario, VeterinarioController.getProfile);
router.put("/actualizar-perfil", authenticateToken, requireVeterinario, VeterinarioController.updateProfile);
router.delete("/account", authenticateToken, requireVeterinario, VeterinarioController.deleteAccount);

// Rutas específicas para veterinarios - gestión de clientes
router.get("/clientes", authenticateToken, requireVeterinario, VeterinarioController.getAllClientes);
router.get("/clientes/:id", authenticateToken, requireVeterinario, VeterinarioController.getClienteById);
router.get("/clientes-con-mascotas", authenticateToken, requireVeterinario, VeterinarioController.getClientesConMascotas);

//Rutas para subir imagen de perfil
router.post("/subir-imagen", authenticateToken, requireVeterinario, uploadPersona.single('imagen'), VeterinarioController.subirImagen);

// Rutas para listado de veterinarios en general y veterinarios en particular
router.get("/", VeterinarioController.getAll);
router.get("/:id", VeterinarioController.getById);

module.exports = router;