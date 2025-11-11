module.exports = (sequelize, DataTypes) => {
  const Servicios = sequelize.define(
    "Servicios",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_mascota: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_tipo_servicio: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_personal_confirmado: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      fecha_hora_solicitada: {
        type: DataTypes.DATE,
        allowNull: false
      },
      estado: {
        type: DataTypes.ENUM("Solicitado", "Confirmado", "Realizado", "Cancelado"),
        allowNull: false,
        defaultValue: "Solicitado"
      }
    },
    {
      tableName: "servicios",
      timestamps: false
    }
  );

  Servicios.associate = (models) => {
    Servicios.belongsTo(models.TiposServicio, {
      foreignKey: "id_tipo_servicio",
      as: "tipo_servicio",
      onDelete: "CASCADE"
    });

    Servicios.belongsTo(models.Mascota, {
      foreignKey: "id_mascota",
      as: "mascota",
      onDelete: "CASCADE"
    });

    Servicios.belongsTo(models.Cliente, {
      foreignKey: "id_cliente",
      as: "cliente",
      onDelete: "CASCADE"
    });

    Servicios.belongsTo(models.Veterinario, {
      foreignKey: "id_personal_confirmado",
      as: "veterinario",
      onDelete: "SET NULL"
    });
  };

  return Servicios;
};
