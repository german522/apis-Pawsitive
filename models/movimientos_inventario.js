module.exports = (sequelize, DataTypes) => {
  const MovimientoInventario = sequelize.define(
    "MovimientoInventario",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "productos",
          key: "id",
        },
      },

      id_responsable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "veterinarios",
          key: "id",
        },
      },

      tipo: {
        type: DataTypes.ENUM(
          "entrada",
          "salida",
          "devolucion",
          "caducidad",
          "venta"
        ),
        allowNull: false,
      },

      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      fecha_movimiento: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      motivo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "movimientos_inventario",
      timestamps: false,
    }
  );

  MovimientoInventario.associate = (models) => {

    MovimientoInventario.belongsTo(models.Producto, {
      foreignKey: "id_producto",
      as: "producto",
      onDelete: "RESTRICT",
    });

    MovimientoInventario.belongsTo(models.Veterinario, {
      foreignKey: "id_responsable",
      as: "responsable",
      onDelete: "RESTRICT",
    });
  };

  return MovimientoInventario;
};