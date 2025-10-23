module.exports = (sequelize, DataTypes) => {
  const Cita = sequelize.define('Cita', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora: { type: DataTypes.TIME, allowNull: false },
    motivo: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.ENUM('Agendada','Cancelada','Completada'), defaultValue:'Agendada' }
  }, {
    tableName: 'Citas'  // <- forzamos el nombre exacto de la tabla
  });

  Cita.associate = (models) => {
    Cita.belongsTo(models.Mascota, { foreignKey: 'id_mascota' });
    Cita.belongsTo(models.Persona, { foreignKey: 'id_cliente', as: 'cliente' });
    Cita.belongsTo(models.Veterinario, { foreignKey: 'id_veterinario' });
  };

  return Cita;
};
