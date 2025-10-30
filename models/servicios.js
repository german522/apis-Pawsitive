'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Servicios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Servicios.init({
    id_mascota: DataTypes.INTEGER,
    id_cliente: DataTypes.INTEGER,
    id_tipo_servicio: DataTypes.INTEGER,
    id_personal_confirmado: DataTypes.INTEGER,
    fecha_hora_solicitada: DataTypes.DATE,
    estado: DataTypes.STRING,
    costo: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Servicios',
  });
  return Servicios;
};