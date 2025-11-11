"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("servicios", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_mascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "mascotas",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      id_tipo_servicio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tiposservicio",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      id_personal_confirmado: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "veterinarios",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      fecha_hora_solicitada: {
        type: Sequelize.DATE,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM("Solicitado", "Confirmado", "Realizado", "Cancelado"),
        allowNull: false,
        defaultValue: "Solicitado"
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("servicios");
  }
};
