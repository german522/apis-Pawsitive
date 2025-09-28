'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vacunas', {
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
      // descripcion eliminado
    }, {
      tableName: "vacunas"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vacunas');
  }
};