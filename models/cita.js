module.exports = (sequelize, DataTypes) => {
  const Cita = sequelize.define('Cita', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_mascota: { type: DataTypes.INTEGER, allowNull: false },
    id_cliente: { type: DataTypes.INTEGER, allowNull: false },
    id_veterinario: { type: DataTypes.INTEGER, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora: { type: DataTypes.TIME, allowNull: false },
    motivo: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.ENUM('Agendada','Cancelada','Completada'), defaultValue:'Agendada' }
  }, {
    tableName: 'citas',
    timestamps: false  
  });

  Cita.associate = (models) => {
    Cita.belongsTo(models.Mascota, { foreignKey: 'id_mascota' });
    Cita.belongsTo(models.Persona, { foreignKey: 'id_cliente', as: 'cliente' });
    Cita.belongsTo(models.Veterinario, { foreignKey: 'id_veterinario' });
    Cita.hasOne(models.Consulta, { foreignKey: 'id_cita', as: 'consulta', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
  };

  return Cita;
};
