"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tipos_producto", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "categorias",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: "uq_categoria_tipo",
      },
    }, {
      tableName: "tipos_producto"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tipos_producto");
  },
};