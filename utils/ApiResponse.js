class ApiResponse {
  static send(success, message, data = null, res, statusCode = 200) {
    const response = {
      success,
      message
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  // Método para respuestas exitosas
  static success(message, data = null, res, statusCode = 200) {
    return this.send(true, message, data, res, statusCode);
  }

  // Método para respuestas de error
  static error(message, res, statusCode = 500, data = null) {
    return this.send(false, message, data, res, statusCode);
  }

  // Método para validaciones fallidas
  static validation(message, errors = null, res) {
    return this.send(false, message, errors, res, 400);
  }

  // Método para recursos no encontrados
  static notFound(message, res) {
    return this.send(false, message, null, res, 404);
  }

  // Método para conflictos (como duplicados)
  static conflict(message, res) {
    return this.send(false, message, null, res, 409);
  }

  // Método para no autorizado
  static unauthorized(message, res) {
    return this.send(false, message, null, res, 401);
  }

  // Método para acceso denegado
  static forbidden(message, res) {
    return this.send(false, message, null, res, 403);
  }
}

module.exports = ApiResponse;