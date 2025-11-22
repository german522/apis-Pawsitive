'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tokenxpersona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tokenxpersona.init({
    id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'tokenxpersona',
  });
  return tokenxpersona;
};