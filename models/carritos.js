module.exports = (sequelize, DataTypes) => {
  const Carrito = sequelize.define(
    "Carrito",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      id_persona: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "personas", key: "id" },
      },

      estado: {
        type: DataTypes.ENUM("abierto", "cerrado"),
        allowNull: false,
        defaultValue: "abierto",
      },

      fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      fecha_cierre: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "carritos",
      timestamps: false,
    }
  );

  Carrito.associate = (models) => {
    Carrito.belongsTo(models.Persona, {
      foreignKey: "id_persona",
      as: "persona",
    });

    Carrito.hasMany(models.CarritoItem, {
      foreignKey: "id_carrito",
      as: "items",
    });

    Carrito.hasOne(models.Compra, {
      foreignKey: "id_carrito",
      as: "compra",
    });
  };

  return Carrito;
};
