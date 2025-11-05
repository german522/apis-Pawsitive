// controllers/ConsultaController.js
const { ConsultaRepository } = require('../repositories');
const { Cita } = require('../models');
const ApiResponse = require('../utils/ApiResponse');

const ConsultaController = {
  // Crear una nueva consulta (solo veterinarios)
  crearConsulta: async (req, res) => {
    try {
      const { id_cita, diagnostico, observaciones, tratamiento_sugerido } = req.body;
      const user = req.user;

      if (user.tipo !== 'veterinario') {
        return ApiResponse.forbidden('Solo los veterinarios pueden registrar consultas.', res);
      }

      const cita = await Cita.findByPk(id_cita);
      if (!cita) return ApiResponse.notFound('Cita no encontrada.', res);

      if (cita.estado !== 'Completada') {
        return ApiResponse.validation('Solo se pueden registrar consultas para citas completadas.', null, res);
      }

      const existente = await ConsultaRepository.obtenerPorCita(id_cita);
      if (existente) return ApiResponse.conflict('Esta cita ya tiene una consulta registrada.', res);

      const nuevaConsulta = await ConsultaRepository.crearConsulta({
        id_cita,
        diagnostico,
        observaciones,
        tratamiento_sugerido
      });

      return ApiResponse.success('Consulta creada correctamente.', nuevaConsulta, res, 201);
    } catch (error) {
      console.error('Error al crear consulta:', error);
      return ApiResponse.error('Error interno del servidor.', res, 500, error.message);
    }
  },

  // Listar todas las consultas (filtradas por tipo de usuario)
  listarConsultas: async (req, res) => {
    try {
      const user = req.user;
      let consultas = await ConsultaRepository.listarConsultas();

      if (user.tipo === 'cliente') {
        consultas = consultas.filter(c => c.cita?.cliente?.id === user.id);
      } else if (user.tipo === 'veterinario') {
        consultas = consultas.filter(c => c.cita?.id_veterinario === user.veterinario?.id);
      }

      return ApiResponse.success('Consultas obtenidas correctamente.', consultas, res);
    } catch (error) {
      console.error('Error al listar consultas:', error);
      return ApiResponse.error('Error al listar consultas.', res, 500, error.message);
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

  // Actualizar una consulta (solo veterinarios)
  actualizarConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      const { diagnostico, observaciones, tratamiento_sugerido } = req.body;
      const user = req.user;

      if (user.tipo !== 'veterinario') {
        return ApiResponse.forbidden('Solo los veterinarios pueden modificar consultas.', res);
      }

      const actualizada = await ConsultaRepository.actualizarConsulta(id, {
        diagnostico,
        observaciones,
        tratamiento_sugerido
      });

      if (!actualizada) {
        return ApiResponse.notFound('Consulta no encontrada.', res);
      }

      return ApiResponse.success('Consulta actualizada correctamente.', actualizada, res);
    } catch (error) {
      console.error('Error al actualizar consulta:', error);
      return ApiResponse.error('Error al actualizar la consulta.', res, 500, error.message);
    }
  },

  // Eliminar una consulta (solo veterinarios)
  eliminarConsulta: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (user.tipo !== 'veterinario') {
        return ApiResponse.forbidden('Solo los veterinarios pueden eliminar consultas.', res);
      }

      const eliminada = await ConsultaRepository.eliminarConsulta(id);
      if (!eliminada) return ApiResponse.notFound('Consulta no encontrada.', res);

      return ApiResponse.success('Consulta eliminada correctamente.', null, res);
    } catch (error) {
      console.error('Error al eliminar consulta:', error);
      return ApiResponse.error('Error al eliminar la consulta.', res, 500, error.message);
    }
  }
};

module.exports = ConsultaController;