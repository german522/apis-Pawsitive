module.exports = (sequelize, DataTypes) => {
  const Expediente = sequelize.define("Expediente", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_mascota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    alergias: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    antecedentes_patologicos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observaciones_generales: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "Expedientes",
    timestamps: true
  });

  Expediente.associate = (models) => {
    Expediente.belongsTo(models.Mascota, {
      foreignKey: "id_mascota",
      as: "mascota"
    });
  };

  return Expediente;
};
