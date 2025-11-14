module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define(
    "Cliente",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_persona: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        }
      },
      fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "clientes",
      timestamps: false
    }
  );

  Cliente.associate = (models) => {
    Cliente.belongsTo(models.Persona, {
      foreignKey: "id_persona",
      as: "persona",
      onDelete: "CASCADE"
    });
    Cliente.hasMany(models.Mascota, {
      foreignKey: "id_cliente",
      as: "mascotas",
      onDelete: "CASCADE"
    });
    Cliente.hasMany(models.Cita, {
      foreignKey: "id_cliente",
      as: "citas",
      onDelete: "CASCADE"
    });
  };

  return Cliente;
};