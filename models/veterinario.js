module.exports = (sequelize, DataTypes) => {
  const Veterinario = sequelize.define(
    "Veterinario",
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
      cedula: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      especialidad: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: "veterinarios",
      timestamps: false
    }
  );

  Veterinario.associate = (models) => {
    Veterinario.belongsTo(models.Persona, {
      foreignKey: "id_persona",
      as: "persona",
      onDelete: "CASCADE"
    });
    Veterinario.hasMany(models.Cita, {
      foreignKey: "id_veterinario",
      as: "citas",
      onDelete: "CASCADE"
    });
    Veterinario.hasMany(models.Consulta, {
      foreignKey: "id_veterinario",
      as: "consultas",
      onDelete: "CASCADE"
    });
    Veterinario.hasMany(models.VacunaxMascota, {
      foreignKey: "id_veterinario",
      as: "vacunasAplicadas",
      onDelete: "SET NULL"
    });
    Veterinario.hasMany(models.MovimientoInventario, {
      foreignKey: "id_responsable",
      as: "movimientos_inventario",
      onDelete: "RESTRICT",
    });
  };

  return Veterinario;
};