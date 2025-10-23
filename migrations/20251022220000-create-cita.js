'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Citas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      hora: {
        type: Sequelize.TIME,
        allowNull: false
      },
      motivo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('Agendada', 'Cancelada', 'Completada'),
        defaultValue: 'Agendada'
      },
      id_mascota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Mascotas',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      id_veterinario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Veterinarios',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Citas');
  }
};
