'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('personas', 'verificado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    
    await queryInterface.addColumn('personas', 'codigo_verificacion', {
      type: Sequelize.STRING(6),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'codigo_expiracion', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('personas', 'verificado');
    await queryInterface.removeColumn('personas', 'codigo_verificacion');
    await queryInterface.removeColumn('personas', 'codigo_expiracion');
  }
};