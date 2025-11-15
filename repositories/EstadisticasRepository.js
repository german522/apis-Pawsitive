const { Cliente, Veterinario } = require("../models");

class EstadisticasRepository {

  async contarClientes() {
    return await Cliente.count();
  }

  async contarVeterinarios() {
    return await Veterinario.count();
  }
}

module.exports = new EstadisticasRepository();
