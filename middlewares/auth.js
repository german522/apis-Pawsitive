const jwt = require('jsonwebtoken');
const { PersonaRepository } = require('../repositories');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe
    const persona = await PersonaRepository.getById(decoded.id);
    if (!persona) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    req.user = {
      id: persona.id,
      correo: persona.correo,
      nombre: persona.nombre,
      tipo: decoded.tipo, // 'cliente' o 'veterinario'
      tipoId: decoded.tipoId // id del cliente o veterinario
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token no válido'
    });
  }
};

// Middleware para verificar que sea cliente
const requireCliente = (req, res, next) => {
  if (req.user.tipo !== 'cliente') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere ser cliente'
    });
  }
  next();
};

// Middleware para verificar que sea veterinario
const requireVeterinario = (req, res, next) => {
  if (req.user.tipo !== 'veterinario') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere ser veterinario'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireCliente,
  requireVeterinario
};