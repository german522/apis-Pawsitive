const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthUtils {
  // Hashear contraseña
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Comparar contraseña
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generar token JWT
  static generateToken(persona, tipo, tipoId) {
    const payload = {
      id: persona.id,
      correo: persona.correo,
      nombre: persona.nombre,
      tipo: tipo, // 'cliente' o 'veterinario'
      tipoId: tipoId // id del registro en tabla cliente o veterinario
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h' // Token válido por 24 horas
    });
  }

  // Generar refresh token (opcional)
  static generateRefreshToken(persona) {
    const payload = {
      id: persona.id,
      correo: persona.correo
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      expiresIn: '7d' // Refresh token válido por 7 días
    });
  }

  // Verificar token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

module.exports = AuthUtils;