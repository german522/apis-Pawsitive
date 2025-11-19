"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("compras_detalle", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      id_compra: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "compras",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        unique: "uq_compra_producto", // índice único compuesto
      },

      id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "productos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        unique: "uq_compra_producto", // índice único compuesto
      },

      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
    }, {
      tableName: "compras_detalle"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("compras_detalle");
  },
};