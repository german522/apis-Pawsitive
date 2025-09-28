'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mascotas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      especie: {
        type: Sequelize.ENUM('perro', 'gato', 'ave', 'reptil', 'roedor', 'otro'),
        allowNull: false
      },
      raza: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      sexo: {
        type: Sequelize.ENUM('macho', 'hembra'),
        allowNull: false
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      peso: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      historial_medico:{
        type: Sequelize.TEXT,
        allowNull: false
      },
      URL_imagen:{
        type: Sequelize.TEXT,
        allowNull: true
      },
    }, {
      tableName: "mascotas"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mascotas');
  }
};