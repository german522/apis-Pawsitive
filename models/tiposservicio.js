"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TiposServicio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //TiposServicio.hasMany(models.Servicios, { foreignKey: 'id_tipo_servicio', as: 'servicios' }); //Servicios Foraneo
    }
  }

  TiposServicio.init(
    {
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "TiposServicio",
      tableName: "TiposServicios",
    }
  );
  return TiposServicio;
};
