const express = require("express");
const router = express.Router();
const ComprasController = require("../controllers/ComprasController");
const { authenticateToken, requireCliente, requireVeterinario } = require("../middlewares/auth");

// 8️⃣ Crear compra desde carrito cerrado (solo cliente)
router.post("/", authenticateToken, requireCliente, ComprasController.crearCompra);

// 9️⃣ Actualizar estado de pago (solo veterinario)
router.post("/:id/estado", authenticateToken, requireVeterinario, ComprasController.actualizarEstadoPago);

// 🔟 Obtener compra por id (cliente o veterinario)
router.get("/:id", authenticateToken, ComprasController.obtenerCompraPorId);

// 1️⃣1️⃣ Obtener compras del cliente
router.get("/cliente/lista", authenticateToken, requireCliente, ComprasController.obtenerComprasCliente);

// 1️⃣2️⃣ Obtener ventas del veterinario
router.get("/veterinario/lista", authenticateToken, requireVeterinario, ComprasController.obtenerVentasVeterinario);

module.exports = router;
