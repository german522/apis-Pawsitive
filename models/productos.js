module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define(
    "Producto",
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

      id_especie: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "especies",
          key: "id",
        },
      },

      id_tipo_producto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "tipos_producto",
          key: "id",
        },
      },

      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      URL_imagen: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      stock_actual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      estado: {
        type: DataTypes.ENUM("activo", "inactivo"),
        allowNull: false,
        defaultValue: "activo",
      },

      presentacion: {
        type: DataTypes.ENUM(
          "tabletas",
          "suspension",
          "inyeccion",
          "pipeta",
          "gotero",
          "sobre",
          "bulto",
          "unidad"
        ),
        allowNull: true,
      },

      unidad_medida: {
        type: DataTypes.ENUM("ml", "l", "g", "mg", "unidad"),
        allowNull: true,
      },

      fecha_caducidad: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      requiere_receta: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "productos",
      timestamps: false,
    }
  );

  Producto.associate = (models) => {
    Producto.belongsTo(models.Categoria, {
      foreignKey: "id_categoria",
      as: "categoria",
      onDelete: "RESTRICT",
    });

    Producto.belongsTo(models.Especie, {
      foreignKey: "id_especie",
      as: "especie",
      onDelete: "SET NULL",
    });

    Producto.belongsTo(models.TipoProducto, {
      foreignKey: "id_tipo_producto",
      as: "tipo_producto",
      onDelete: "SET NULL",
    });
  };

  return Producto;
};