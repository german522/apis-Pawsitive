// Migración 1: add-receta-fields-to-consultas.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Agregar el campo folio_receta
    await queryInterface.addColumn('consultas', 'folio_receta', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true
    });

    // 2. Agregar el campo estado_receta
    await queryInterface.addColumn('consultas', 'estado_receta', {
      type: Sequelize.ENUM('PENDIENTE', 'DISPENSADA', 'EXPIRADA'),
      allowNull: true,
      defaultValue: 'PENDIENTE' 
    });

    // 3. Agregar el campo fecha_expiracion_receta
    await queryInterface.addColumn('consultas', 'fecha_expiracion_receta', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('consultas', 'fecha_expiracion_receta');
    await queryInterface.removeColumn('consultas', 'estado_receta');
    await queryInterface.removeColumn('consultas', 'folio_receta');
  }
};