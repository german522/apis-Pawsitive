"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("movimientos_inventario", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      },

      id_responsable: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "veterinarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      tipo: {
        type: Sequelize.ENUM(
          "entrada",
          "salida",
          "devolucion",
          "caducidad",
          "venta"
        ),
        allowNull: false,
      },

      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      fecha_movimiento: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      motivo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("movimientos_inventario");
  },
};