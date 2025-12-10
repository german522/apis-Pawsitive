module.exports = (sequelize, DataTypes) => {
  const Compra = sequelize.define(
    "Compra",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      id_carrito: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "carritos",
          key: "id",
        },
      },

      id_veterinario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "veterinarios",
          key: "id",
        },
      },

      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      metodo_pago: {
        type: DataTypes.ENUM("efectivo", "tarjeta"),
        allowNull: false,
      },

      estado_pago: {
        type: DataTypes.ENUM("pendiente", "pagado", "cancelado"),
        allowNull: false,
        defaultValue: "pendiente",
      },

      folio: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
      },

    },
    {
      tableName: "compras",
      timestamps: false,
    }
  );

  Compra.associate = (models) => {
    Compra.belongsTo(models.Carrito, {
      foreignKey: "id_carrito",
      as: "carrito",
      onDelete: "RESTRICT",
    });

    Compra.belongsTo(models.Veterinario, {
      foreignKey: "id_veterinario",
      as: "veterinario",
      onDelete: "RESTRICT",
    });

    Compra.hasMany(models.CompraDetalle, {
      foreignKey: "id_compra",
      as: "detalles",
      onDelete: "CASCADE",
    });
  };

  return Compra;
};
