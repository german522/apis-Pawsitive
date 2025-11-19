module.exports = (sequelize, DataTypes) => {
  const CompraDetalle = sequelize.define(
    "Comprasxdetalle",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      id_compra: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "compras",
          key: "id",
        },
      },

      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "productos",
          key: "id",
        },
      },

      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "compras_detalle",
      timestamps: false,
    }
  );

  CompraDetalle.associate = (models) => {
    CompraDetalle.belongsTo(models.Compra, {
      foreignKey: "id_compra",
      as: "compra",
      onDelete: "CASCADE",
    });

    CompraDetalle.belongsTo(models.Producto, {
      foreignKey: "id_producto",
      as: "producto",
      onDelete: "RESTRICT",
    });
  };

  return CompraDetalle;
};