module.exports = (sequelize, DataTypes) => {
  const Cirugia = sequelize.define(
    "Cirugia",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
        allowNull: false,
        references: {
          model: 'veterinarios',
          key: 'id'
        }
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false
      },
      tipo_cirugia: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notas_preoperatorias: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notas_postoperatorias: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      estado: {
        type: DataTypes.ENUM('Agendada', 'Confirmada', 'En proceso', 'Terminada', 'Cancelada'),
        allowNull: false,
        defaultValue: 'Agendada'
      }
    },
    {
      tableName: "cirugias",
      timestamps: false
    }
  );

  Cirugia.associate = (models) => {
    Cirugia.belongsTo(models.Mascota, {
      foreignKey: "id_mascota",
      as: "mascota",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
    Cirugia.belongsTo(models.Veterinario, {
      foreignKey: "id_veterinario",
      as: "veterinario",
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  };

  return Cirugia;
};