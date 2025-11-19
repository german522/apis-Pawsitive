"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("productos", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "categorias",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      id_especie: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "especies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      id_tipo_producto: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "tipos_producto",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      URL_imagen: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      stock_actual: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      estado: {
        type: Sequelize.ENUM("activo", "inactivo"),
        allowNull: false,
        defaultValue: "activo",
      },

      presentacion: {
        type: Sequelize.ENUM(
          "tabletas",
          "suspension",
          "inyeccion",
          "pipeta",
          "gotero",
          "sobre",
          "bulto",
          "unidad"
        ),
        allowNull: true,
      },

      unidad_medida: {
        type: Sequelize.ENUM("ml", "l", "g", "mg", "unidad"),
        allowNull: true,
      },

      fecha_caducidad: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      requiere_receta: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    }, {
      tableName: "productos"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("productos");
  },
};