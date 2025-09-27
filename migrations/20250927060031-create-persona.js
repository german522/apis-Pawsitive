'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('personas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido_paterno: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido_materno: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      correo: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      contrasena: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      URL_imagen: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    }, {
      tableName: "personas"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('personas');
  }
};