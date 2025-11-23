"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "categorias",
      [
        { nombre: "medicamentos" },
        { nombre: "accesorios" },
        { nombre: "alimento" },
        { nombre: "higiene_cuidado" }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categorias", null, {});
  },
};
