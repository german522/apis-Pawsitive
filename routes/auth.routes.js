const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { authenticateToken } = require("../middlewares/auth");
const { validateLogin } = require("../middlewares/validation");

// Rutas públicas (sin autenticación)
router.post("/login", validateLogin, AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/verify-code", AuthController.verifyCode);

// Rutas protegidas (requieren autenticación)
router.get("/verify", authenticateToken, AuthController.verifyToken);

module.exports = router;