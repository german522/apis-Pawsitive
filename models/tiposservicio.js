module.exports = (sequelize, DataTypes) => {
  const TiposServicio = sequelize.define(
    "TiposServicio",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      costo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      }
    },
    {
      tableName: "tiposservicio",
      timestamps: false
    }
  );

  TiposServicio.associate = (models) => {
    TiposServicio.hasMany(models.Servicios, {
      foreignKey: "id_tipo_servicio",
      as: "servicios",
      onDelete: "CASCADE"
    });
  };

  return TiposServicio;
};
