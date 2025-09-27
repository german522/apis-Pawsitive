module.exports = (sequelize, DataTypes) => {
  const Vacuna = sequelize.define(
    "Vacuna",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: "vacunas",
      timestamps: false
    }
  );

  Vacuna.associate = (models) => {
    Vacuna.belongsToMany(models.Mascota, {
      through: models.VacunaxMascota,
      foreignKey: "id_vacuna",
      otherKey: "id_mascota",
      as: "mascotas"
    });
  };

  return Vacuna;
};