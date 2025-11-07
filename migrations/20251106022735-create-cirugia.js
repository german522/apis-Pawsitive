'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cirugias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_mascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mascotas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_veterinario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'veterinarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_hora: {
        type: Sequelize.DATE,
        allowNull: false
      },
      tipo_cirugia: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      notas_preoperatorias: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      notas_postoperatorias: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('Agendada', 'Confirmada', 'En proceso', 'Terminada', 'Cancelada'),
        allowNull: false,
        defaultValue: 'Agendada'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cirugias');
  }
};
