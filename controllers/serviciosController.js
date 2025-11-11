const { ServicioRepository } = require('../repositories');
const { enviarCorreoCitaAgendada, enviarCorreoCitaCancelada } = require('../utils/emailService');
const ApiResponse = require('../utils/ApiResponse');
const { ValidationError, DatabaseError } = require('sequelize');

// Obtener todos los servicios
exports.getAll = async (req, res) => {
  try {
    const servicios = await ServicioRepository.getAll();
    return ApiResponse.success("Servicios obtenidos exitosamente.", { servicios }, res);
  } catch (error) {
    console.error("Error en GET /servicios:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener servicio por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await ServicioRepository.getById(id);

    if (!servicio) {
      return ApiResponse.notFound("Servicio no encontrado.", res);
    }

    return ApiResponse.success("Servicio obtenido exitosamente.", { servicio }, res);
  } catch (error) {
    console.error("Error en GET /servicios/:id:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Crear nuevo servicio (solo clientes)
exports.create = async (req, res) => {
  try {
    const { id_mascota, id_tipo_servicio, fecha_hora_solicitada, id_personal_confirmado } = req.body;
    const id_cliente = req.user.tipo === "cliente" ? req.user.tipoId : null;

    if (!id_cliente) {
      return ApiResponse.forbidden("Solo los clientes pueden registrar servicios.", res);
    }

    if (!id_mascota || !id_tipo_servicio || !fecha_hora_solicitada) {
      return ApiResponse.validation("Faltan campos obligatorios: id_mascota, id_tipo_servicio, fecha_hora_solicitada.", null, res);
    }

    const servicio = await ServicioRepository.create({
      id_mascota,
      id_cliente,
      id_tipo_servicio,
      fecha_hora_solicitada,
      estado: "Solicitado",
      id_personal_confirmado: id_personal_confirmado || null,
    });

    const datos = await ServicioRepository.getDetallesServicio(servicio.id);

    if (datos.veterinarioEmail) {
      await enviarCorreoCitaAgendada({
        data: {
          toVeterinario: datos.veterinarioEmail,
          veterinarioNombre: datos.veterinarioNombre,
          clienteNombre: datos.clienteNombre,
          mascotaNombre: datos.mascotaNombre,
          fecha: datos.fecha,
          hora: datos.hora,
          motivo: datos.tipoServicioNombre,
        },
      });
    }

    const msg = datos.veterinarioEmail
      ? "Servicio solicitado exitosamente. Se notificó al veterinario."
      : "Servicio solicitado exitosamente. Asigne un veterinario para notificar.";

    return ApiResponse.success(msg, { servicio }, res, 201);

  } catch (error) {
    console.error("Error en POST /servicios:", error);

    if (error instanceof ValidationError) {
      return ApiResponse.validation(error.errors.map(e => e.message), null, res);
    }
    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }

    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Actualizar servicio
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const servicio = await ServicioRepository.update(id, updateData);
    if (!servicio) {
      return ApiResponse.notFound("Servicio no encontrado.", res);
    }

    return ApiResponse.success("Servicio actualizado exitosamente.", { servicio }, res);
  } catch (error) {
    console.error("Error en PUT /servicios/:id:", error);

    if (error instanceof DatabaseError) {
      return ApiResponse.error("Error en la base de datos.", res);
    }
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Eliminar servicio
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ServicioRepository.delete(id);
    if (!deleted) {
      return ApiResponse.notFound("Servicio no encontrado.", res);
    }

    return ApiResponse.success("Servicio eliminado exitosamente.", null, res);
  } catch (error) {
    console.error("Error en DELETE /servicios/:id:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener servicios por cliente autenticado
exports.getByCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;

    if (req.user.tipo !== "cliente" || req.user.tipoId != id_cliente) {
      return ApiResponse.forbidden("No puedes ver los servicios de otro cliente.", res);
    }

    const servicios = await ServicioRepository.getByCliente(id_cliente);
    return ApiResponse.success("Servicios del cliente obtenidos exitosamente.", { servicios }, res);
  } catch (error) {
    console.error("Error en GET /servicios/cliente/:id_cliente:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener servicios por mascota
exports.getByMascota = async (req, res) => {
  try {
    const { id_mascota } = req.params;
    const servicios = await ServicioRepository.getByMascota(id_mascota);
    return ApiResponse.success("Servicios de la mascota obtenidos exitosamente.", { servicios }, res);
  } catch (error) {
    console.error("Error en GET /servicios/mascota/:id_mascota:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Obtener servicios por estado
exports.getByEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    const servicios = await ServicioRepository.getByEstado(estado);
    return ApiResponse.success("Servicios obtenidos por estado exitosamente.", { servicios }, res);
  } catch (error) {
    console.error("Error en GET /servicios/estado/:estado:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Actualizar estado del servicio (con notificaciones)
exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const servicio = await ServicioRepository.updateEstado(id, estado);
    if (!servicio) {
      return ApiResponse.notFound("Servicio no encontrado.", res);
    }

    const datos = await ServicioRepository.getDetallesServicio(id);

    if (estado === "Confirmado") {
      await enviarCorreoCitaAgendada({
        data: {
          toCliente: datos.clienteEmail,
          toVeterinario: datos.veterinarioEmail,
          clienteNombre: datos.clienteNombre,
          veterinarioNombre: datos.veterinarioNombre,
          mascotaNombre: datos.mascotaNombre,
          fecha: datos.fecha,
          hora: datos.hora,
          motivo: datos.tipoServicioNombre,
        },
      });
    } else if (estado === "Cancelado") {
      await enviarCorreoCitaCancelada({
        data: {
          toCliente: datos.clienteEmail,
          toVeterinario: datos.veterinarioEmail,
          clienteNombre: datos.clienteNombre,
          veterinarioNombre: datos.veterinarioNombre,
          mascotaNombre: datos.mascotaNombre,
          fecha: datos.fecha,
          hora: datos.hora,
          motivo: datos.tipoServicioNombre,
        },
      });
    }

    return ApiResponse.success("Estado del servicio actualizado exitosamente.", { servicio }, res);
  } catch (error) {
    console.error("Error en PUT /servicios/:id/estado:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

// Asignar veterinario
exports.assignVeterinario = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_personal_confirmado } = req.body;

    const servicio = await ServicioRepository.assignVeterinario(id, id_personal_confirmado);
    if (!servicio) {
      return ApiResponse.notFound("Servicio no encontrado.", res);
    }

    return ApiResponse.success("Veterinario asignado exitosamente.", { servicio }, res);
  } catch (error) {
    console.error("Error en PUT /servicios/:id/asignar-veterinario:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};
