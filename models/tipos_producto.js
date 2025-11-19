module.exports = (sequelize, DataTypes) => {
  const TipoProducto = sequelize.define(
    "TipoProducto",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_categoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categorias",
          key: "id",
        },
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "tipos_producto",
      timestamps: false,
    }
  );

  TipoProducto.associate = (models) => {
    TipoProducto.belongsTo(models.Categoria, {
      foreignKey: "id_categoria",
      as: "categoria",
      onDelete: "CASCADE",
    });

    TipoProducto.hasMany(models.Producto, {
      foreignKey: "id_tipo_producto",
      as: "productos",
      onDelete: "SET NULL",
    });
  };

  return TipoProducto;
};