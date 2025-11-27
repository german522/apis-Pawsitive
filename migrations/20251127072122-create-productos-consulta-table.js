// Migración 2: create-productos-consulta-table.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos_consulta', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_consulta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'consultas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      dosis: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      cantidad_autorizada: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cantidad_dispensada: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    });

    // Añadir índice compuesto
    await queryInterface.addConstraint('productos_consulta', {
      fields: ['id_consulta', 'id_producto'],
      type: 'unique',
      name: 'unique_producto_por_consulta'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos_consulta');
  }
};