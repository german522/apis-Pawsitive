module.exports = (sequelize, DataTypes) => {
  const CarritoItem = sequelize.define(
    "CarritoItem",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      id_carrito: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "carritos", key: "id" },
      },

      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "productos", key: "id" },
      },

      cantidad: { type: DataTypes.INTEGER, allowNull: false },

      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "carritoxitems",
      timestamps: false,
    }
  );

  CarritoItem.associate = (models) => {
    CarritoItem.belongsTo(models.Carrito, {
      foreignKey: "id_carrito",
      as: "carrito",
    });

    CarritoItem.belongsTo(models.Producto, {
      foreignKey: "id_producto",
      as: "producto",
    });
  };

  return CarritoItem;
};
