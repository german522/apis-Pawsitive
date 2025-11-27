module.exports = (sequelize, DataTypes) => {
  const ProductoConsulta = sequelize.define(
    "ProductoConsulta",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_consulta:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'consultas',
                key: 'id'
            }
        },
        id_producto:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'productos',
                key: 'id'
            }
        },
        dosis:{
            type: DataTypes.STRING(255),
            allowNull: false
        },
        cantidad_autorizada:{
            type: DataTypes.INTEGER,
            allowNull: false 
        },
        cantidad_dispensada:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        tableName: "productos_consulta",
        timestamps: false
    }
  );
    ProductoConsulta.associate = (models) => {
        ProductoConsulta.belongsTo(models.Consulta, {
            foreignKey: "id_consulta",
            as: "consulta",
            onDelete: "CASCADE"
        });
        ProductoConsulta.belongsTo(models.Producto, {
            foreignKey: "id_producto",
            as: "producto",
            onDelete: "RESTRICT"
        });
    };
    return ProductoConsulta;
}
