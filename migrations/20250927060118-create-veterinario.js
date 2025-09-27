'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('veterinarios', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_persona: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cedula: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      especialidad: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    }, {
      tableName: "veterinarios"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('veterinarios');
  }
};