const serviciosRepository = require("../repositories/serviciosRepository");
const {
  enviarCorreoCitaAgendada,
  enviarCorreoCitaCancelada,
} = require("../utils/emailService");

class ServiciosController {
  async getAll(req, res) {
    try {
      const servicios = await serviciosRepository.findAll();
      res.json({
        success: true,
        data: servicios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los servicios",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const servicio = await serviciosRepository.findById(id);

      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: "Servicio no encontrado",
        });
      }

      res.json({
        success: true,
        data: servicio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el servicio",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const {
        id_mascota,
        id_tipo_servicio,
        fecha_hora_solicitada,
        costo,
        id_personal_confirmado, // para asignar veterinario
      } = req.body;

      // Cliente autenticado desde el token
      const id_cliente = req.user.tipo === "cliente" ? req.user.tipoId : null;

      if (!id_cliente) {
        return res.status(403).json({
          success: false,
          message: "Solo los clientes pueden registrar servicios.",
        });
      }

      const servicio = await serviciosRepository.create({
        id_mascota,
        id_cliente,
        id_tipo_servicio,
        fecha_hora_solicitada,
        costo,
        estado: "Solicitado",
        id_personal_confirmado: id_personal_confirmado || null,
      });

      // Obtener detalles para el correo
      const datos = await serviciosRepository.getDetallesServicio(servicio.id);

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

      res.status(201).json({
        success: true,
        message: datos.veterinarioEmail
          ? "Servicio solicitado exitosamente. Se notificó al veterinario."
          : "Servicio solicitado exitosamente. Asigne un veterinario para notificar.",
        data: servicio,
      });
    } catch (error) {
      console.error("Error creando servicio:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear el servicio",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const servicio = await serviciosRepository.update(id, updateData);

      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: "Servicio no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Servicio actualizado exitosamente",
        data: servicio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el servicio",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await serviciosRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Servicio no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Servicio eliminado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el servicio",
        error: error.message,
      });
    }
  }

  async getByCliente(req, res) {
    try {
      const { id_cliente } = req.params;

      // Asegurar que el cliente autenticado solo vea sus servicios
      if (req.user.tipo !== "cliente" || req.user.tipoId != id_cliente) {
        return res.status(403).json({
          success: false,
          message: "No puedes ver los servicios de otro cliente.",
        });
      }

      const servicios = await serviciosRepository.findByCliente(id_cliente);

      res.json({
        success: true,
        data: servicios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los servicios del cliente",
        error: error.message,
      });
    }
  }

  async getByMascota(req, res) {
    try {
      const { id_mascota } = req.params;
      const servicios = await serviciosRepository.findByMascota(id_mascota);

      res.json({
        success: true,
        data: servicios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los servicios de la mascota",
        error: error.message,
      });
    }
  }

  async getByEstado(req, res) {
    try {
      const { estado } = req.params;
      const servicios = await serviciosRepository.findByEstado(estado);

      res.json({
        success: true,
        data: servicios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los servicios por estado",
        error: error.message,
      });
    }
  }

  async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const servicio = await serviciosRepository.updateEstado(id, estado);
      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: "Servicio no encontrado",
        });
      }

      // Obtener detalles para el correo
      const datos = await serviciosRepository.getDetallesServicio(id);

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

      res.json({
        success: true,
        message: "Estado del servicio actualizado exitosamente",
        data: servicio,
      });
    } catch (error) {
      console.error("Error en updateEstado:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar el estado del servicio",
        error: error.message,
      });
    }
  }

  async assignVeterinario(req, res) {
    try {
      const { id } = req.params;
      const { id_personal_confirmado } = req.body;

      const servicio = await serviciosRepository.assignVeterinario(
        id,
        id_personal_confirmado
      );

      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: "Servicio no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Veterinario asignado exitosamente",
        data: servicio,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al asignar el veterinario",
        error: error.message,
      });
    }
  }
}

module.exports = new ServiciosController();
