const { ClienteRepository, MascotaRepository, ConsultaRepository, ProductoConsultaRepository, ProductoRepository, MovimientoInventarioRepository } = require('../repositories'); 
const { Cita, Cliente, Persona, Mascota, Producto, sequelize } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const RecetaUtils = require('../utils/RecetaUtils'); 
const emailService = require("../utils/emailService");



const ConsultaController = {

crearConsulta: async (req, res) => {
    // 1. INICIAR TRANSACCIÓN
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
        const id_veterinario = user.tipoId; 

        // 2. Validaciones Iniciales
        if (user.tipo !== 'veterinario') {
            await transaction.rollback(); 
            return ApiResponse.forbidden('Solo los veterinarios pueden registrar consultas.', res);
        }

        // 🚨 CAMBIO CLAVE 1: Forzar la carga de id_cliente de la cita
        const cita = await Cita.findByPk(id_cita, {
            attributes: ['id', 'id_mascota', 'estado', 'id_cliente'] // Añadimos id_cliente
        });

        if (!cita) {
            await transaction.rollback();
            return ApiResponse.notFound('Cita no encontrada.', res);
        }

        if (cita.estado !== 'Agendada') {
            await transaction.rollback();
            return ApiResponse.validation('Solo se pueden registrar consultas para citas agendadas.', null, res);
        }

        const existente = await ConsultaRepository.obtenerPorCita(id_cita);
        if (existente) {
            await transaction.rollback();
            return ApiResponse.conflict('Esta cita ya tiene una consulta registrada.', res);
        }

        // Se mantiene la validación de campos obligatorios
        if (!id_cita || !diagnostico || !observaciones || !tratamiento_sugerido) {
            await transaction.rollback();
            return ApiResponse.validation('Complete todos los campos antes de guardar la consulta', null, res);
        }

        if (productos_recetados && !Array.isArray(productos_recetados)) {
            await transaction.rollback();
            return ApiResponse.validation('El campo productos_recetados debe ser una lista válida.', null, res);
        }
        
        const tieneReceta = productos_recetados && productos_recetados.length > 0;
        
        // 3. Generar Folio y Fecha
        const folio_receta = tieneReceta ? RecetaUtils.generateFolio() : null;
        const fecha_expiracion_receta = tieneReceta ? RecetaUtils.generateExpirationDate() : null;

        // 4. Crear registro en tabla 'consultas'
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

        // Variable para recolectar nombres de productos para el correo
        let listaProductosParaCorreo = [];

        // 5. Procesar Productos (Si hay receta)
        if (tieneReceta) {
            const itemsRecetados = productos_recetados.map(p => ({
                id_consulta: nuevaConsulta.id,
                id_producto: p.id_producto,
                dosis: p.dosis,
                cantidad_autorizada: p.cantidad 
            }));

            // --- VALIDACIÓN DE STOCK Y RECOLECCIÓN DE DATOS ---
            for (const item of itemsRecetados) {
                const producto = await ProductoRepository.obtenerPorId(item.id_producto); 
                
                if (!producto) {
                    await transaction.rollback();
                    return ApiResponse.error(`El producto con ID ${item.id_producto} no fue encontrado.`, res, 404);
                }
                
                if (producto.stock_actual < item.cantidad_autorizada) {
                    await transaction.rollback();
                    return ApiResponse.error(
                        `Stock insuficiente para '${producto.nombre}'. Requieres ${item.cantidad_autorizada} pero hay ${producto.stock_actual}.`,
                        res, 400
                    );
                }

                // Guardamos info visual para el correo
                listaProductosParaCorreo.push({
                    nombre: producto.nombre,
                    dosis: item.dosis,
                    cantidad: item.cantidad_autorizada
                });
            }
            
            // --- CREACIÓN DE ITEMS Y DESCUENTO ---
            await ProductoConsultaRepository.crearItems(itemsRecetados, { transaction }); 

            for (const item of itemsRecetados) {
                await ProductoRepository.decrementarStockReceta(
                    item.id_producto, 
                    item.cantidad_autorizada, 
                    { transaction }
                );

                await MovimientoInventarioRepository.crearMovimiento({
                    id_producto: item.id_producto,
                    id_responsable: id_veterinario,
                    tipo: 'salida', 
                    cantidad: item.cantidad_autorizada,
                    motivo: `Reserva por Receta (Folio: ${folio_receta})`
                }, { transaction });
            }
        }

        // 6. Actualizar Estado de la Cita
        cita.estado = 'Completada';
        await cita.save({ transaction }); 

        // 7. CONFIRMAR TRANSACCIÓN
        await transaction.commit();

        // ------------------------------------------------------------------
        // 🔥 ENVÍO DE CORREO MEJORADO (Post-Commit) 🔥
        if (tieneReceta) {
            try {

                // 🚨 CAMBIO CLAVE 2: Usar el id_cliente cargado de la cita para buscar al Cliente/Persona
                const idCliente = cita.id_cliente; 

                // Forzar la carga de la Persona sin usar el Repositorio de Clientes
                const cliente = await Cliente.findByPk(idCliente, {
                    include: [{ 
                        model: Persona, 
                        as: 'persona', 
                        attributes: ['nombre', 'correo'] 
                    }]
                });
                
                // Obtener la mascota (solo para el nombre en el cuerpo del correo)
                const mascota = await Mascota.findByPk(cita.id_mascota, { attributes: ['nombre'] }); 
                
                const persona = cliente ? cliente.persona : null;
                
                // 🚨 CAMBIO CLAVE 3: Validación robusta contra cadenas vacías ("")
                const correoDestino = persona ? String(persona.correo || '').trim() : null; 
                
                if (cliente && mascota && correoDestino) {
                    const data = {
                        toCliente: correoDestino, 
                        clienteNombre: persona.nombre, 
                        mascotaNombre: mascota.nombre, 
                        folio_receta,
                        fecha_expiracion: RecetaUtils.formatDateForEmail ? RecetaUtils.formatDateForEmail(fecha_expiracion_receta) : fecha_expiracion_receta,
                        
                        // DATOS COMPLETOS PARA EL RESUMEN CLÍNICO
                        diagnostico: diagnostico,
                        observaciones: observaciones || 'Sin observaciones adicionales.',
                        tratamiento: tratamiento_sugerido,
                        listaProductos: listaProductosParaCorreo 
                    };
                    
                    await emailService.enviarCorreoRecetaGenerada({ data }); 
                    
                } else {
                    console.warn(`[NOTIF] No se envió correo. Faltan datos: ClienteID: ${cita.id_cliente}, Email: ${correoDestino ? 'SI' : 'NO'}`);
                }
            } catch (emailError) {
                console.error('[ERROR CORREO] Fallo al enviar correo de receta:', emailError.message);
            }
        }
        // ------------------------------------------------------------------
        
        return ApiResponse.success(
            'Consulta creada correctamente.', 
            { ...nuevaConsulta.toJSON(), folio_receta }, 
            res, 
            201
        );

    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        
        console.error('Error al crear consulta:', error);
        return ApiResponse.error('Error interno del servidor.', res, 500, error.message);
    }
},

crearConsultaEmergencia: async (req, res) => {
    // 1. INICIAR TRANSACCIÓN
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

        // 2. Validaciones
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
            return ApiResponse.validation("Complete: id_mascota, id_cliente y diagnostico.", null, res);
        }
        if (productos_recetados && !Array.isArray(productos_recetados)) {
            await transaction.rollback();
            return ApiResponse.validation('Productos recetados debe ser una lista.', null, res);
        }

        const tieneReceta = productos_recetados && productos_recetados.length > 0;
        
        // 3. Generar Folio y Fecha
        const folio_receta = tieneReceta ? RecetaUtils.generateFolio() : null;
        const fecha_expiracion_receta = tieneReceta ? RecetaUtils.generateExpirationDate() : null;

        // 4. Crear Consulta (id_cita es NULL)
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

        // Variable para recolectar nombres
        let listaProductosParaCorreo = [];

        // 5. Procesar Productos
        if (tieneReceta) {
            const itemsRecetados = productos_recetados.map(p => ({
                id_consulta: nuevaConsulta.id,
                id_producto: p.id_producto,
                dosis: p.dosis,
                cantidad_autorizada: p.cantidad
            }));
            
            // --- VALIDACIÓN DE STOCK Y RECOLECCIÓN ---
            for (const item of itemsRecetados) {
                const producto = await ProductoRepository.obtenerPorId(item.id_producto); 
                
                if (!producto) {
                    await transaction.rollback();
                    return ApiResponse.error(`Producto ID ${item.id_producto} no encontrado.`, res, 404);
                }
                
                if (producto.stock_actual < item.cantidad_autorizada) {
                    await transaction.rollback();
                    return ApiResponse.error(
                         `Stock insuficiente para '${producto.nombre}'. Requieres ${item.cantidad_autorizada} pero hay ${producto.stock_actual}.`, res, 400
                    );
                }

                // Guardar info para correo
                listaProductosParaCorreo.push({
                    nombre: producto.nombre,
                    dosis: item.dosis,
                    cantidad: item.cantidad_autorizada
                });
            }
            
            // --- CREACIÓN DE ITEMS Y DESCUENTO ---
            await ProductoConsultaRepository.crearItems(itemsRecetados, { transaction }); 

            for (const item of itemsRecetados) {
                await ProductoRepository.decrementarStockReceta(
                    item.id_producto, 
                    item.cantidad_autorizada, 
                    { transaction }
                );

                await MovimientoInventarioRepository.crearMovimiento({
                    id_producto: item.id_producto,
                    id_responsable: id_veterinario,
                    tipo: 'salida', 
                    cantidad: item.cantidad_autorizada,
                    motivo: `Reserva por Receta (Folio: ${folio_receta})`
                }, { transaction });
            }
        }

        // 6. CONFIRMAR TRANSACCIÓN
        await transaction.commit();

        // ------------------------------------------------------------------
        // 🔥 ENVÍO DE CORREO MEJORADO (Post-Commit) 🔥
        if (tieneReceta) {
            const cliente = await ClienteRepository.getById(id_cliente); 
            // Asumiendo que getById del repo mascota devuelve el nombre
            const mascota = await MascotaRepository.getById(id_mascota); 
            
            const correoDestino = (cliente && cliente.persona) ? (cliente.persona.email || cliente.persona.correo) : null;
            
            if (cliente && mascota && correoDestino) {
                const data = {
                    toCliente: correoDestino, 
                    clienteNombre: cliente.persona.nombre, 
                    mascotaNombre: mascota.nombre, 
                    folio_receta,
                    fecha_expiracion: RecetaUtils.formatDateForEmail ? RecetaUtils.formatDateForEmail(fecha_expiracion_receta) : fecha_expiracion_receta,
                    
                    // DATOS COMPLETOS
                    diagnostico: diagnostico,
                    observaciones: observaciones || 'Ninguna',
                    tratamiento: tratamiento_sugerido || 'Ver indicaciones.',
                    listaProductos: listaProductosParaCorreo
                };
                
                try {
                    await emailService.enviarCorreoRecetaGenerada({ data }); 
                } catch (emailError) {
                    console.error("[ERROR CORREO] Fallo envío en emergencia.", emailError);
                }
            } else {
                console.warn(`[NOTIF] Faltan datos para enviar correo emergencia. ID Cliente: ${id_cliente}`);
            }
        }
        // ------------------------------------------------------------------

        return ApiResponse.success(
            "Consulta de emergencia creada.",
            { ...nuevaConsulta.toJSON(), folio_receta },
            res,
            201
        );

    } catch (error) {
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
},

obtenerRecetaPorFolio: async (req, res) => {
    try {
        const { folio_receta } = req.params;
        const user = req.user;

        // 1. Validación de Roles
        if (user.tipo !== 'veterinario' && user.tipo !== 'administrador' /* && user.tipo !== 'farmacia' */) {
            return ApiResponse.forbidden('Acceso denegado. Solo personal autorizado para dispensar recetas.', res);
        }

        // 2. Buscar la consulta
        const consulta = await ConsultaRepository.obtenerPorFolioConProductos(folio_receta);

        if (!consulta) {
            return ApiResponse.notFound('Receta no encontrada para el folio proporcionado.', res);
        }
        
        // 3. Obtener el cliente (dueño) asociado
        const idCliente = consulta.id_cliente; 
        let clienteData = null;
        if (idCliente) {
            clienteData = await ClienteRepository.getById(idCliente); 
        }

        // 🚨 FIX 1: Proporcionar un arreglo vacío si no hay productos recetados
        const productosRecetados = consulta.productos_recetados || []; 
        
        // 4. Formatear la respuesta (datos requeridos para el surtido)
        const recetaData = {
            id_consulta: consulta.id,
            folio: consulta.folio_receta,
            estado: consulta.estado_receta,
            fecha_expiracion: consulta.fecha_expiracion_receta,
            diagnostico: consulta.diagnostico,
            observaciones: consulta.observaciones,
            tratamiento_sugerido: consulta.tratamiento_sugerido,
            mascota_nombre: consulta.mascota.nombre,
            // Usamos la variable 'productosRecetados' ya validada
            productos_a_surtir: productosRecetados.map(item => ({
                id_producto: item.id_producto,
                nombre: item.producto.nombre,
                unidad: item.producto.unidad_medida,
                dosis: item.dosis,
                autorizada: item.cantidad_autorizada,
                dispensada_previa: item.cantidad_dispensada || 0,
                // Cantidad Máxima que aún puede llevar
                cantidad_restante: item.cantidad_autorizada - (item.cantidad_dispensada || 0) 
            }))
        };

        return ApiResponse.success('Detalles de la receta obtenidos correctamente.', recetaData, res);

    } catch (error) {
        console.error('Error al obtener receta por folio:', error);
        return ApiResponse.error('Error interno del servidor.', res, 500, error.message);
    }
},

/**
 * POST: Procesa la dispensación de medicamentos.
 */
dispensarReceta: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // 🚨 Solo requerimos el folio_receta en el body
        const { folio_receta } = req.body; 
        const user = req.user;

        // 1. Validación de Roles
        if (user.tipo !== 'veterinario' && user.tipo !== 'administrador' /* ... */) {
            await transaction.rollback();
            return ApiResponse.forbidden('Solo personal autorizado puede dispensar recetas.', res);
        }

        if (!folio_receta) {
            await transaction.rollback();
            return ApiResponse.validation('Debe proporcionar el folio de la receta.', null, res);
        }

        // 2. Buscar la consulta y validar estado
        const consulta = await ConsultaRepository.obtenerPorFolioConProductos(folio_receta);

        if (!consulta) {
            await transaction.rollback();
            return ApiResponse.notFound('Receta no encontrada para el folio proporcionado.', res);
        }

        if (consulta.estado_receta === 'DISPENSADA') {
            await transaction.rollback();
            return ApiResponse.conflict('Esta receta ya ha sido dispensada.', res);
        }
        
        const productosRecetados = consulta.productos_recetados || []; 
        
        if (productosRecetados.length === 0) {
             await transaction.rollback();
             return ApiResponse.validation('La receta no tiene productos asociados para dispensar.', null, res);
        }

        // 🚨 NUEVA LÓGICA SIMPLIFICADA 🚨
        
        // 3. Preparar la actualización: Marcar cantidad_dispensada = cantidad_autorizada para todos
        const itemsAActualizar = productosRecetados.map(item => ({
            id_producto: item.id_producto,
            // Marcamos la cantidad dispensada como la cantidad total autorizada
            cantidad_dispensada: item.cantidad_autorizada 
        }));
        
        // 4. El estado final siempre es DISPENSADA
        const nuevoEstado = 'DISPENSADA'; 

        // 5. Ejecutar actualizaciones transaccionales
        await ConsultaRepository.marcarEstadoReceta(consulta.id, nuevoEstado, transaction);
        await ProductoConsultaRepository.actualizarCantidadDispensada(consulta.id, itemsAActualizar, transaction);

        // 6. Finalizar Transacción
        await transaction.commit();

        return ApiResponse.success(
            `Receta con folio ${folio_receta} dispensada correctamente.`,
            { id_consulta: consulta.id, folio_receta, estado_receta: nuevoEstado },
            res
        );

    } catch (error) {
        await transaction.rollback();
        console.error('Error al dispensar receta:', error);
        return ApiResponse.error('Error interno del servidor al dispensar la receta.', res, 500, error.message);
    }
},

};




module.exports = ConsultaController;