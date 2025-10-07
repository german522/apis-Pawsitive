class VerificationUtils {
  // Generar código de 6 dígitos
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generar fecha de expiración (15 minutos desde ahora)
  static generateExpirationDate() {
    const now = new Date();
    return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos
  }

  // Verificar si el código ha expirado
  static isExpired(expirationDate) {
    return new Date() > new Date(expirationDate);
  }
}

module.exports = VerificationUtils;