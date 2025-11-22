'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('personas', 'reset_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('personas', 'reset_token_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('personas', 'reset_token');
    await queryInterface.removeColumn('personas', 'reset_token_expires');
  }
};