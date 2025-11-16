module.exports = (sequelize, DataTypes) => {
  const VacunaxMascota = sequelize.define(
    "VacunaxMascota",
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
      id_vacuna: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'vacunas',
          key: 'id'
        }
      },
      fecha_aplicacion: {
        type: DataTypes.DATEONLY,
        allowNull: true
      }
    },
    {
      tableName: "vacunasxMascota",
      timestamps: false
    }
  );

  VacunaxMascota.associate = (models) => {
    VacunaxMascota.belongsTo(models.Mascota, {
      foreignKey: "id_mascota",
      as: "mascota"
    });
    VacunaxMascota.belongsTo(models.Vacuna, {
      foreignKey: "id_vacuna",
      as: "vacuna"
    });
    VacunaxMascota.belongsTo(models.Veterinario, {
      foreignKey: "id_veterinario",
      as: "veterinario",
      onDelete: "SET NULL"
    })
  };

  return VacunaxMascota;
};