"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Servicios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Servicios.belongsTo(models.TiposServicio, { foreignKey: 'id_tipo_servicio', as: 'tipo_servicio' });//TipoServicio Foraneo
      // Servicios.belongsTo(models.Mascotas, { foreignKey: 'id_mascota',as: 'mascota' }); //Mascota Foranea
      // Servicios.belongsTo(models.Clientes, { foreignKey: 'id_cliente', as: 'cliente' }); // Cliente Foraneo
      // Servicios.belongsTo(models.Veterinarios, { foreignKey: 'id_personal_confirmado', as: 'veterinario' }); // Veterinario Foraneo
    }
  }
  Servicios.init(
    {
      id_mascota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      id_tipo_servicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      id_personal_confirmado: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fecha_hora_solicitada: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      estado: {
        type: DataTypes.ENUM(
          "Solicitado",
          "Confirmado",
          "Realizado",
          "Cancelado"
        ),
        allowNull: false,
        defaultValue: "Solicitado",
      },
      costo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          isDecimal: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Servicios",
      tableName: "Servicios",
    }
  );
  return Servicios;
};
