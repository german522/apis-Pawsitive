"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "especies",
      [
        { nombre: "perro" },
        { nombre: "gato" },
        { nombre: "ave" },
        { nombre: "reptil" },
        { nombre: "roedor" },
        { nombre: "otro" }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("especies", null, {});
  },
};
