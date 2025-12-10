"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("compras", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      id_carrito: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "carritos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      id_veterinario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "veterinarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      metodo_pago: {
        type: Sequelize.ENUM("efectivo", "tarjeta"),
        allowNull: false,
      },

      estado_pago: {
        type: Sequelize.ENUM("pendiente", "pagado", "cancelado"),
        allowNull: false,
        defaultValue: "pendiente",
      },
      
      folio: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }

    }, {
      tableName: "compras"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("compras");
  },
};