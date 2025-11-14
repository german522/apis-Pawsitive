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

      if (cita.estado !== 'Agendada') {
        return ApiResponse.validation('Solo se pueden registrar consultas para citas agendadas.', null, res);
      }

      const existente = await ConsultaRepository.obtenerPorCita(id_cita);
      if (existente) return ApiResponse.conflict('Esta cita ya tiene una consulta registrada.', res);

      if (!id_cita || !diagnostico || !observaciones || !tratamiento_sugerido) {
        return ApiResponse.validation('Complete todos los campos antes de guardar la consulta', null, res);
      }

      const nuevaConsulta = await ConsultaRepository.crearConsulta({
        id_cita,
        id_mascota: cita.id_mascota,
        diagnostico,
        observaciones,
        tratamiento_sugerido,
        fecha_consulta: new Date()
      });

      return ApiResponse.success('Consulta creada correctamente.', nuevaConsulta, res, 201);
    } catch (error) {
      console.error('Error al crear consulta:', error);
      return ApiResponse.error('Error interno del servidor.', res, 500, error.message);
    }
  },

  // Listar todas las consultas (filtradas por tipo de usuario)
listarConsultasPorUsuario : async (req, res) => {
  try {
    const { tipo, tipoId } = req.user; // viene del middleware JWT
    const consultas = await ConsultaRepository.listarConsultasPorUsuario(tipo, tipoId);

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
};

module.exports = ConsultaController;