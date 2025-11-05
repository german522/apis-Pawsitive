module.exports = (sequelize, DataTypes) => {
  const Mascota = sequelize.define(
    "Mascota",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id",
        },
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      especie: {
        type: DataTypes.ENUM(
          "perro",
          "gato",
          "ave",
          "reptil",
          "roedor",
          "otro"
        ),
        allowNull: false,
      },
      raza: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      sexo: {
        type: DataTypes.ENUM("macho", "hembra"),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      peso: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      URL_imagen: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "mascotas",
      timestamps: false,
    }
  );

  Mascota.associate = (models) => {
    Mascota.belongsTo(models.Cliente, {
      foreignKey: "id_cliente",
      as: "cliente",
      onDelete: "CASCADE",
    });
    Mascota.belongsToMany(models.Vacuna, {
      through: models.VacunaxMascota,
      foreignKey: "id_mascota",
      otherKey: "id_vacuna",
      as: "vacunas",
    });
  };

  return Mascota;
};
