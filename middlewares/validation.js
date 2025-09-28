const validateRegisterCliente = (req, res, next) => {
  const { nombre, apellido_paterno, telefono, correo, contrasena } = req.body;

  const errors = [];

  if (!nombre || nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!apellido_paterno || apellido_paterno.trim().length < 2) {
    errors.push('El apellido paterno debe tener al menos 2 caracteres');
  }

  if (!correo || !isValidEmail(correo)) {
    errors.push('Debe proporcionar un correo electrónico válido');
  }

  if (!contrasena || contrasena.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (telefono && !isValidPhone(telefono)) {
    errors.push('El teléfono debe tener entre 10 y 15 dígitos');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors
    });
  }

  next();
};

const validateRegisterVeterinario = (req, res, next) => {
  const { nombre, apellido_paterno, telefono, correo, contrasena, cedula } = req.body;

  const errors = [];

  // Validaciones básicas de persona
  if (!nombre || nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!apellido_paterno || apellido_paterno.trim().length < 2) {
    errors.push('El apellido paterno debe tener al menos 2 caracteres');
  }

  if (!correo || !isValidEmail(correo)) {
    errors.push('Debe proporcionar un correo electrónico válido');
  }

  if (!contrasena || contrasena.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (telefono && !isValidPhone(telefono)) {
    errors.push('El teléfono debe tener entre 10 y 15 dígitos');
  }

  // Validaciones específicas de veterinario
  if (!cedula || cedula.trim().length < 5) {
    errors.push('La cédula profesional es requerida y debe tener al menos 5 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      success: false,
      message: 'Correo y contraseña son requeridos'
    });
  }

  if (!isValidEmail(correo)) {
    return res.status(400).json({
      success: false,
      message: 'Debe proporcionar un correo electrónico válido'
    });
  }

  next();
};

// Funciones auxiliares
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone);
};

module.exports = {
  validateRegisterCliente,
  validateRegisterVeterinario,
  validateLogin
};