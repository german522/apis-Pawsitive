module.exports = (sequelize, DataTypes) => {
  const Especie = sequelize.define(
    "Especies",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.ENUM(
          "perro",
          "gato",
          "ave",
          "reptil",
          "roedor",
          "otro"
        ),
        allowNull: false,
      },
    },
    {
      tableName: "especies",
      timestamps: false,
    }
  );

  Especie.associate = (models) => {
    Especie.hasMany(models.Producto, {
      foreignKey: "id_especie",
      as: "productos",
      onDelete: "SET NULL",
    });
  };

  return Especie;
};