module.exports = (sequelize, DataTypes) => {
  const Persona = sequelize.define(
    "Persona",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      apellido_paterno: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      apellido_materno: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      telefono: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      URL_imagen: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      verificado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      codigo_verificacion: {
        type: DataTypes.STRING(6),
        allowNull: true
      },
      codigo_expiracion: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "personas",
      timestamps: false
    }
  );

  Persona.associate = (models) => {
    Persona.hasOne(models.Cliente, {
      foreignKey: "id_persona",
      as: "cliente",
      onDelete: "CASCADE"
    });
    Persona.hasOne(models.Veterinario, {
      foreignKey: "id_persona",
      as: "veterinario",
      onDelete: "CASCADE"
    });
  };

  return Persona;
};