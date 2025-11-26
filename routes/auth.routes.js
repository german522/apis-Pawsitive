const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { authenticateToken } = require("../middlewares/auth");
const { validateLogin } = require("../middlewares/validation");
const ClienteController = require("../controllers/ClienteController");
const VeterinarioController = require("../controllers/VeterinarioController");

// Rutas públicas (sin autenticación)
router.post("/login", validateLogin, AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/verify-code", AuthController.verifyCode);
router.post("/resend-verification-code", AuthController.resendVerificationCode);

// Recuperación de contraseña
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Actualizar datos del usuario (requiere autenticación)
router.put("/update-profile", authenticateToken, ClienteController.updateProfile);
router.put("/update-profile", authenticateToken, VeterinarioController.updateProfile);

// Rutas protegidas
router.get("/verify", authenticateToken, AuthController.verifyToken);

module.exports = router;