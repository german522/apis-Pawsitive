module.exports = (sequelize, DataTypes) => {
  const Consulta = sequelize.define(
    "Consulta",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_cita: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: 'citas',
          key: 'id'
        }
      },
      id_mascota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'mascotas',
          key: 'id'
        } 
      },
      id_veterinario: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
          model: 'veterinarios',
          key: 'id'
        } 
      },
      folio_receta: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
      },
      estado_receta: {
        type: DataTypes.ENUM('PENDIENTE', 'DISPENSADA', 'EXPIRADA'),
        allowNull: true,
        defaultValue: 'PENDIENTE'
      },
      fecha_expiracion_receta: {
        type: DataTypes.DATE,
        allowNull: true
      },
      diagnostico: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tratamiento_sugerido: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      fecha_consulta: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "consultas",
      timestamps: false
    }
  );

  Consulta.associate = (models) => {
    Consulta.belongsTo(models.Cita, {
      foreignKey: "id_cita",
      as: "cita",
      onDelete: "CASCADE"
    });
    Consulta.belongsTo(models.Mascota, {
      foreignKey: "id_mascota",
      as: "mascota",
      onDelete: "CASCADE"
    });
    Consulta.belongsTo(models.Veterinario, {
      foreignKey: "id_veterinario",
      as: "veterinario",
      onDelete: "SET NULL"
    });
    
    Consulta.hasMany(models.ProductoConsulta, {
      foreignKey: "id_consulta",
      as: "productos_recetados", 
      onDelete: "CASCADE"
    });
  };

  return Consulta;
};