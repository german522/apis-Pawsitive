module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define(
    "Categoria",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.ENUM(
          "medicamentos",
          "accesorios",
          "alimento",
          "higiene_cuidado"
        ),
        allowNull: false,
      },
    },
    {
      tableName: "categorias",
      timestamps: false,
    }
  );

  Categoria.associate = (models) => {
    Categoria.hasMany(models.TipoProducto, {
      foreignKey: "id_categoria",
      as: "tipos_producto",
      onDelete: "CASCADE",
    });

    Categoria.hasMany(models.Producto, {
      foreignKey: "id_categoria",
      as: "productos",
      onDelete: "RESTRICT",
    });
  };

  return Categoria;
};