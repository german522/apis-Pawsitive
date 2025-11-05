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
        allowNull: false,
        unique: true,
        references: {
          model: 'citas',
          key: 'id'
        }
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
  };

  return Consulta;
};