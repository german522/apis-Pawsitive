"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("categorias", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.ENUM(
          "medicamentos",
          "accesorios",
          "alimento",
          "higiene_cuidado"
        ),
        allowNull: false,
      },
    }, {
      tableName: "categorias"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("categorias");
  },
};