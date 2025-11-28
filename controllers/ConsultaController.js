const { ClienteRepository, MascotaRepository, ConsultaRepository, ProductoConsultaRepository, ProductoRepository, MovimientoInventarioRepository } = require('../repositories'); 
const { Cita, sequelize } = require('../models'); 
const ApiResponse = require('../utils/ApiResponse');
const RecetaUtils = require('../utils/RecetaUtils'); 
const emailService = require("../utils/emailService");

const formatDateForEmail = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const ConsultaController = {

  // Asegúrate de que esta función esté definida al inicio de tu controlador o en un utilitario
/* const formatDateForEmail = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};
*/

crearConsulta: async (req, res) => {
    // 3. INICIAR TRANSACCIÓN
    const transaction = await sequelize.transaction();
    try {
        const { 
            id_cita, 
            diagnostico, 
            observaciones, 
            tratamiento_sugerido,
            productos_recetados 
        } = req.body;
        const user = req.user;
        const id_veterinario = user.tipoId; // ID del responsable

        if (user.tipo !== 'veterinario') {
            return ApiResponse.forbidden('Solo los veterinarios pueden registrar consultas.', res);
        }

        const cita = await Cita.findByPk(id_cita);
        if (!cita) return ApiResponse.notFound('Cita no encontrada.', res);

        if (cita.estado !== 'Agendada') {
            return ApiResponse.validation('Solo se pueden registrar consultas para citas agendadas.', null, res);
        }

        const existente = await ConsultaRepository.obtenerPorCita(id_cita);
        if (existente) return ApiResponse.conflict('Esta cita ya tiene una consulta registrada.', res);

        if (!id_cita || !diagnostico || !observaciones || !tratamiento_sugerido) {
            return ApiResponse.validation('Complete todos los campos antes de guardar la consulta', null, res);
        }
        // **5. Nueva Validación de Productos Recetados**
        if (productos_recetados && !Array.isArray(productos_recetados)) {
            await transaction.rollback();
            return ApiResponse.validation('El campo productos_recetados debe ser una lista válida.', null, res);
        }
        
        const tieneReceta = productos_recetados && productos_recetados.length > 0;
        
        // 6. Generar Folio y Fecha de Expiración (solo si hay productos)
        const folio_receta = tieneReceta ? RecetaUtils.generateFolio() : null;
        const fecha_expiracion_receta = tieneReceta ? RecetaUtils.generateExpirationDate() : null;

        // 7. Crear Consulta (pasando el folio y la transacción)
        const nuevaConsulta = await ConsultaRepository.crearConsulta({
            id_cita,
            id_mascota: cita.id_mascota,
            id_veterinario,
            diagnostico,
            observaciones,
            tratamiento_sugerido,
            fecha_consulta: new Date(),
            folio_receta, 
            estado_receta: folio_receta ? 'PENDIENTE' : null, 
            fecha_expiracion_receta
        }, { transaction }); 

        // 8. Crear Items de Receta Y DESCONTAR INVENTARIO
        if (tieneReceta) {
            const itemsRecetados = productos_recetados.map(p => ({
                id_consulta: nuevaConsulta.id,
                id_producto: p.id_producto,
                dosis: p.dosis,
                cantidad_autorizada: p.cantidad 
            }));

            // ------------------------------------------------------------------
            // 🔥 8.1. VALIDACIÓN CRÍTICA DE STOCK (PRE-MOVIMIENTO) 🔥
            for (const item of itemsRecetados) {
                // Asumimos que getById devuelve el objeto Producto con el campo 'stock'
                const producto = await ProductoRepository.getById(item.id_producto); 
                
                if (!producto) {
                    await transaction.rollback();
                    return ApiResponse.error(`El producto con ID ${item.id_producto} no fue encontrado.`, res, 404);
                }
                
                // Validar stock: producto.stock vs cantidad_autorizada
                if (producto.stock_actual < item.cantidad_autorizada) {
                    await transaction.rollback();
                    return ApiResponse.error(
                        `Stock insuficiente para el producto '${producto.nombre}'. Necesitas ${item.cantidad_autorizada} unidades, pero solo hay ${producto.stock} en inventario.`,
                        res, 
                        400
                    );
                }
            }
            // ------------------------------------------------------------------
            
            // 8.2. CREACIÓN Y DESCUENTO (Solo si la validación pasó)
            await ProductoConsultaRepository.crearItems(itemsRecetados, { transaction }); 

            // 🔥 LÓGICA DE DECREMENTO Y LOG DE INVENTARIO 🔥
            for (const item of itemsRecetados) {
                // Descontar stock en la tabla 'productos'
                await ProductoRepository.decrementarStockReceta(
                    item.id_producto, 
                    item.cantidad_autorizada, 
                    { transaction }
                );

                // Crear log de movimiento en 'movimientos_inventario'
                await MovimientoInventarioRepository.crearMovimiento({
                    id_producto: item.id_producto,
                    id_responsable: id_veterinario,
                    tipo: 'salida', 
                    cantidad: item.cantidad_autorizada,
                    motivo: `Reserva por Receta Médica (Folio: ${folio_receta})`
                }, { transaction });
            }
        }

        // 9. Actualizar Cita
        cita.estado = 'Completada';
        await cita.save({ transaction }); 

        // 10. Finalizar Transacción
        await transaction.commit();

        // ------------------------------------------------------------------
        // 🔥 10.5. ENVÍO DE CORREO (CORRECCIÓN DEL ERROR DE ROLLBACK) 🔥
        if (tieneReceta) {
            
            const id_cliente = cita.id_cliente; 
            const cliente = await ClienteRepository.getById(id_cliente); 
            // Usamos Mascota.findByPk por rendimiento, asumiendo Mascota está disponible.
            const mascota = await Mascota.findByPk(cita.id_mascota, { attributes: ['nombre'] }); 
            
            // Nota: Se ha asumido que el campo correcto de correo es 'email' o 'correo' (como lo tenías). 
            // Usaré 'email' por ser la convención más común, pero revísalo.
            const correoDestino = (cliente && cliente.persona) ? (cliente.persona.email || cliente.persona.correo) : null;

            if (cliente && mascota && correoDestino) {
                const data = {
                    toCliente: correoDestino, 
                    clienteNombre: cliente.persona.nombre, 
                    mascotaNombre: mascota.nombre, 
                    folio_receta,
                    fecha_expiracion: formatDateForEmail(fecha_expiracion_receta) 
                };
                
                // 👇🏼 CORRECCIÓN CLAVE: Usar AWAIT dentro de un TRY/CATCH local.
                try {
                    await emailService.enviarCorreoRecetaGenerada({ data }); 
                } catch (emailError) {
                    // Si el correo falla, lo logueamos, pero la transacción se mantiene
                    console.error('[ERROR CORREO] Fallo al enviar correo de receta, la consulta fue creada.', emailError);
                }
                // 👆🏼
            } else {
                console.warn(`[NOTIF] No se pudo enviar correo de receta: Falta email del cliente o datos de cliente/mascota. Cliente ID: ${id_cliente}`);
            }
        }
        // ------------------------------------------------------------------
        
        // Devolvemos el folio de receta en la respuesta, si existe
        return ApiResponse.success(
            'Consulta creada correctamente.', 
            { ...nuevaConsulta.toJSON(), folio_receta }, 
            res, 
            201
        );
    } catch (error) {
        // 11. Rollback
        await transaction.rollback();
        console.error('Error al crear consulta:', error);
        return ApiResponse.error('Error interno del servidor.', res, 500, error.message);
    }
},

crearConsultaEmergencia: async (req, res) => {
    // 3. INICIAR TRANSACCIÓN
    const transaction = await sequelize.transaction();
    try {
        const { 
            id_mascota, 
            id_cliente, 
            diagnostico, 
            observaciones, 
            tratamiento_sugerido,
            productos_recetados 
        } = req.body;
        const user = req.user;
        const id_veterinario = user.tipoId;

        // ... Validaciones existentes ...
        if (user.tipo !== "veterinario") {
            await transaction.rollback();
            return ApiResponse.forbidden("Solo los veterinarios pueden crear consultas.", res);
        }

        if (!id_veterinario) {
            await transaction.rollback();
            return ApiResponse.unauthorized("No se pudo obtener el veterinario autenticado.", res);
        }

        if (!id_mascota || !id_cliente || !diagnostico) {
            await transaction.rollback();
            return ApiResponse.validation(
                "Complete los campos requeridos: id_mascota, id_cliente y diagnostico.", null, res
            );
        }
        // **5. Nueva Validación de Productos Recetados**
        if (productos_recetados && !Array.isArray(productos_recetados)) {
            await transaction.rollback();
            return ApiResponse.validation('El campo productos_recetados debe ser una lista válida.', null, res);
        }
        // *************************************************************

        const tieneReceta = productos_recetados && productos_recetados.length > 0;
        
        // 6. Generar Folio y Fecha de Expiración (solo si hay productos)
        const folio_receta = tieneReceta ? RecetaUtils.generateFolio() : null;
        const fecha_expiracion_receta = tieneReceta ? RecetaUtils.generateExpirationDate() : null;

        // 7. Crear la consulta de emergencia (pasando el folio y la transacción)
        const nuevaConsulta = await ConsultaRepository.crearConsulta({
            id_cita: null,
            id_mascota,
            id_cliente,
            id_veterinario,
            diagnostico,
            observaciones: observaciones || null,
            tratamiento_sugerido: tratamiento_sugerido || null,
            fecha_consulta: new Date(),
            folio_receta, 
            estado_receta: folio_receta ? 'PENDIENTE' : null, 
            fecha_expiracion_receta
        }, { transaction }); 

        // 8. Crear Items de Receta Y DESCONTAR INVENTARIO
        if (tieneReceta) {
            const itemsRecetados = productos_recetados.map(p => ({
                id_consulta: nuevaConsulta.id,
                id_producto: p.id_producto,
                dosis: p.dosis,
                cantidad_autorizada: p.cantidad
            }));
            
            // ------------------------------------------------------------------
            // 🔥 8.1. VALIDACIÓN CRÍTICA DE STOCK (PRE-MOVIMIENTO) 🔥
            for (const item of itemsRecetados) {
                const producto = await ProductoRepository.obtenerPorId(item.id_producto); 
                
                if (!producto) {
                    await transaction.rollback();
                    return ApiResponse.error(`El producto con ID ${item.id_producto} no fue encontrado.`, res, 404);
                }
                
                if (producto.stock_actual < item.cantidad_autorizada) {
                    await transaction.rollback();
                    return ApiResponse.error(
                        `Stock insuficiente para el producto '${producto.nombre}'. Necesitas ${item.cantidad_autorizada} unidades, pero solo hay ${producto.stock} en inventario.`,
                        res, 
                        400
                    );
                }
            }
            // ------------------------------------------------------------------

            // 8.2. CREACIÓN Y DESCUENTO (Solo si la validación pasó)
            await ProductoConsultaRepository.crearItems(itemsRecetados, { transaction }); 

            // 🔥 LÓGICA DE DECREMENTO Y LOG DE INVENTARIO 🔥
            for (const item of itemsRecetados) {
                // 8.1. Decrementar stock en 'productos'
                await ProductoRepository.decrementarStockReceta(
                    item.id_producto, 
                    item.cantidad_autorizada, 
                    { transaction }
                );

                // 8.2. Crear log de movimiento en 'movimientos_inventario'
                await MovimientoInventarioRepository.crearMovimiento({
                    id_producto: item.id_producto,
                    id_responsable: id_veterinario,
                    tipo: 'salida', 
                    cantidad: item.cantidad_autorizada,
                    motivo: `Reserva por Receta Médica (Folio: ${folio_receta})`
                }, { transaction });
            }
        }

        // 9. Finalizar Transacción
        await transaction.commit();

        // ------------------------------------------------------------------
        // 🔥 9.5. ENVÍO DE CORREO (CORRECCIÓN DEL ERROR DE ROLLBACK) 🔥
        if (tieneReceta) {
            
            const cliente = await ClienteRepository.getById(id_cliente); 
            const mascota = await MascotaRepository.getById(id_mascota); 
            
            const correoDestino = (cliente && cliente.persona) ? (cliente.persona.email || cliente.persona.correo) : null;
            
            if (cliente && mascota && correoDestino) {
                const data = {
                    toCliente: correoDestino, 
                    clienteNombre: cliente.persona.nombre, 
                    mascotaNombre: mascota.nombre, 
                    folio_receta,
                    fecha_expiracion: formatDateForEmail(fecha_expiracion_receta) 
                };
                
                // 👇🏼 CORRECCIÓN CLAVE: Usar AWAIT dentro de un TRY/CATCH local.
                try {
                    await emailService.enviarCorreoRecetaGenerada({ data }); 
                } catch (emailError) {
                    console.error("[ERROR CORREO] Fallo al enviar correo de receta, la consulta fue creada.", emailError);
                }
                // 👆🏼
            } else {
                console.warn(`[NOTIF] No se pudo enviar correo de receta: Falta email del cliente o datos de cliente/mascota. Cliente ID: ${id_cliente}`);
            }
        }
        // ------------------------------------------------------------------

        return ApiResponse.success(
            "Consulta de emergencia y Receta creadas correctamente.",
            { ...nuevaConsulta.toJSON(), folio_receta },
            res,
            201
        );

    } catch (error) {
        // 10. Rollback
        await transaction.rollback();
        console.error("Error al crear consulta de emergencia:", error);
        return ApiResponse.error("Error interno del servidor.", res, 500, error.message);
    }
},

  // Listar todas las consultas (filtradas por tipo de usuario)
listarConsultasPorUsuario : async (req, res) => {
  try {
    const { tipoId } = req.user;
    const consultas = await ConsultaRepository.listarConsultasPorUsuario(tipoId);

    if (!consultas.length) {
      return res.status(404).json({ message: 'No se encontraron consultas para este usuario' });
    }

    res.json(consultas);
  } catch (error) {
    console.error('Error al listar consultas:', error);
    res.status(500).json({ message: 'Error al obtener las consultas', error: error.message });
  }
},


  // Obtener una consulta por ID
  obtenerConsultaPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const consulta = await ConsultaRepository.obtenerPorId(id);
      if (!consulta) return ApiResponse.notFound('Consulta no encontrada.', res);

      return ApiResponse.success('Consulta obtenida correctamente.', consulta, res);
    } catch (error) {
      console.error('Error al obtener consulta:', error);
      return ApiResponse.error('Error al obtener la consulta.', res, 500, error.message);
    }
  },

// Obtener todas las consultas por id_mascota
obtenerConsultasPorMascota: async (req, res) => {
  try {
    const { id_mascota } = req.params;

    const consultas = await ConsultaRepository.obtenerPorMascota(id_mascota);

    if (!consultas.length) {
      return ApiResponse.notFound(
        "No se encontraron consultas para esta mascota.",
        res
      );
    }

    return ApiResponse.success(
      "Consultas obtenidas correctamente.",
      consultas,
      res
    );

  } catch (error) {
    console.error("Error al obtener consultas por mascota:", error);
    return ApiResponse.error(
      "Error interno del servidor.",
      res,
      500,
      error.message
    );
  }
}
};

module.exports = ConsultaController;