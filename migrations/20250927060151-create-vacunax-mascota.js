'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vacunasxMascota', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      id_vacuna: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vacunas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_aplicacion: {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    }, {
      tableName: "vacunasxMascota"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vacunasxMascota');
  }
};