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
    
    async actualizarCantidadDispensada(idConsulta, itemsDispensados, transaction) {
    
    const updates = itemsDispensados.map(item => 
        ProductoConsulta.update(
            { cantidad_dispensada: item.cantidad_dispensada },
            { 
                where: { 
                    id_consulta: idConsulta, 
                    id_producto: item.id_producto 
                },
                transaction 
            }
        )
    );
    return await Promise.all(updates);
}
}

module.exports = new ProductoConsultaRepository();