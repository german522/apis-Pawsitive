"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("carritos", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      estado: {
        type: Sequelize.ENUM("abierto", "cerrado"),
        allowNull: false,
        defaultValue: "abierto",
      },

      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      fecha_cierre: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    }, {
      tableName: "carritos"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("carritos");
  },
};
