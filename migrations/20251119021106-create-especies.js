"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("especies", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.ENUM(
          "perro",
          "gato",
          "ave",
          "reptil",
          "roedor",
          "otro"
        ),
        allowNull: false,
      },
    }, {
      tableName: "especies"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("especies");
  },
};