'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('consultas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: 'citas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_mascota:{
        type:Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mascotas',
          key: 'id'
        },
      },
      diagnostico: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tratamiento_sugerido: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_consulta: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('consultas');
  }
};