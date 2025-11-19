module.exports = (sequelize, DataTypes) => {
  const Carrito = sequelize.define(
    "Carrito",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id",
        },
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
    Carrito.belongsTo(models.Cliente, {
      foreignKey: "id_cliente",
      as: "cliente",
      onDelete: "CASCADE",
    });
    Carrito.hasMany(models.CarritoItem, {
      foreignKey: "id_carrito",
      as: "items",
      onDelete: "CASCADE",
    });
    Carrito.hasOne(models.Compra, {
      foreignKey: "id_carrito",
      as: "compra",
      onDelete: "RESTRICT",
    });
  };

  return Carrito;
};