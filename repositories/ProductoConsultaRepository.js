const { ProductoConsulta, Producto, Consulta } = require('../models');

class ProductoConsultaRepository {
    async crearItems(items, options = {}) {
        if (!items || items.length === 0) {
            return [];
        }
        return await ProductoConsulta.bulkCreate(items, options);
    }

    async obtenerConsultaConProductosPorFolio(folio_receta) {
        return await Consulta.findOne({
            where: { folio_receta },
            include: [
                {
                    model: ProductoConsulta,
                    as: 'productos_consulta',
                    required: true, 
                    include: [
                        {
                            model: Producto,
                            as: 'producto',
                            attributes: ['id', 'nombre', 'precio', 'requiere_receta']
                        }
                    ],
                    attributes: ['id', 'dosis', 'cantidad_autorizada', 'cantidad_dispensada']
                }
            ]
        });
    }
    
    async actualizarCantidadDispensada(id_producto_consulta, cantidad_a_dispensar, options = {}) {
        return await ProductoConsulta.increment(
            { cantidad_dispensada: cantidad_a_dispensar },
            { 
                where: { id: id_producto_consulta }, 
                ...options 
            }
        );
    }
}

module.exports = new ProductoConsultaRepository();