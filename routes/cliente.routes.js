const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/ClienteController");
const { authenticateToken, requireCliente } = require("../middlewares/auth");
const { validateRegisterCliente } = require("../middlewares/validation");
const { uploadPersona } = require("../config/cloudinary");

// Rutas públicas
router.post("/register", validateRegisterCliente, ClienteController.register);

// Rutas protegidas (solo para clientes autenticados)
router.post("/logout", authenticateToken, requireCliente, ClienteController.logout);
router.get("/profile", authenticateToken, requireCliente, ClienteController.getProfile);
router.put("/profile", authenticateToken, requireCliente, ClienteController.updateProfile);
router.delete("/account", authenticateToken, requireCliente, ClienteController.deleteAccount);
router.post("/subir-imagen", authenticateToken, requireCliente, uploadPersona.single('imagen'), ClienteController.subirImagen);

module.exports = router;