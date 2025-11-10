"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Servicios", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_mascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Mascotas",
          key: "id",
        },
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Clientes",
          key: "id",
        },
      },
      id_tipo_servicio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "TiposServicios",
          key: "id",
        },
      },
      id_personal_confirmado: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Veterinarios",
          key: "id",
        },
      },
      fecha_hora_solicitada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM(
          "Solicitado",
          "Confirmado",
          "Realizado",
          "Cancelado"
        ),
        allowNull: false,
        defaultValue: "Solicitado",
      },
      costo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Servicios");
  },
};
