const { Cita, Mascota, Persona, Veterinario, Cliente } = require('../models');
// 💡 NOTA: Asumo que en tu archivo de modelos tienes definidas todas las asociaciones correctamente.

const CitaController = {
  // 📅 Listar citas (filtra según el rol del usuario autenticado)
  listarCitas: async (req, res) => {
  try {
    const { user } = req;
    let filtro = {};

    if (user.tipo === 'cliente') filtro.id_cliente = user.id;
    if (user.tipo === 'veterinario') filtro.id_veterinario = user.id;

    const citas = await Cita.findAll({
      where: filtro,
      include: [
        { model: Mascota },
        { model: Persona, as: 'cliente', attributes: ['nombre', 'correo'] },
        { 
          model: Veterinario,
          include: { 
            model: Persona, 
            as: 'persona',   // ✅ usar el alias definido en el modelo
            attributes: ['nombre'] 
          }
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},


  // 🕒 Agendar una cita
  agendarCita: async (req, res) => {
    try {
      const { fecha, hora, motivo, id_mascota, id_veterinario } = req.body;

      // Buscar la mascota y su cliente (usando el alias 'cliente' en el include)
      const mascota = await Mascota.findOne({
        where: { id: id_mascota },
        include: { model: Cliente, as: 'cliente' }
      });

      if (!mascota) {
        return res.status(404).json({ message: 'Mascota no encontrada' });
      }

      if (!mascota.cliente || mascota.cliente.id !== req.user.id) {
        return res.status(403).json({ 
          message: 'No puedes agendar citas para esta mascota (o no eres el dueño).' 
        });
      }

      // Verificar si ya existe una cita en ese horario
      const existeCita = await Cita.findOne({
        where: { fecha, hora, id_veterinario, estado: 'Agendada' }
      });

      if (existeCita) {
        return res.status(400).json({ message: 'Horario no disponible' });
      }

      // Crear nueva cita
      const nuevaCita = await Cita.create({
        fecha,
        hora,
        motivo,
        id_mascota,
        id_veterinario,
        id_cliente: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Cita agendada correctamente',
        cita: nuevaCita
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ❌ Cancelar una cita
  cancelarCita: async (req, res) => {
    try { 
      const { id } = req.params;
      const cita = await Cita.findByPk(id);

      if (!cita) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      if (req.user.tipo === 'cliente') {
        const cliente = await Cliente.findOne({ where: { id_persona: req.user.id } });

        if (!cliente || cita.id_cliente !== cliente.id) {
          return res.status(403).json({ message: 'No puedes cancelar esta cita' });
        }
      }

      cita.estado = 'Cancelada';
      await cita.save();

      res.json({
        success: true,
        message: 'Cita cancelada correctamente',
        cita
      });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // 🕘 Obtener horarios disponibles
  horariosDisponibles: async (req, res) => {
    try {
      const { fecha, id_veterinario, id_mascota } = req.query;

      if (!fecha || !id_veterinario || !id_mascota) {
        return res.status(400).json({ message: 'Fecha, veterinario y mascota son requeridos' });
      }

      const hoy = new Date().toISOString().slice(0, 10);
      if (fecha < hoy) {
        return res.status(400).json({ message: 'No se pueden consultar horarios para una fecha pasada' });
      }

      const mascota = await Mascota.findOne({
        where: { id: id_mascota },
        include: { model: Cliente, as: 'cliente' }
      });

      if (!mascota) return res.status(404).json({ message: 'Mascota no encontrada' });

      if (!mascota.cliente || mascota.cliente.id !== req.user.id) 
        return res.status(403).json({ 
          message: 'No puedes ver horarios de esta mascota (o no tiene dueño asignado)' 
        });

      const horarioInicio = 9;
      const horarioFin = 17;
      const todosHorarios = [];

      for (let h = horarioInicio; h < horarioFin; h++) {
        todosHorarios.push(`${h.toString().padStart(2, '0')}:00`);
      }

      const citas = await Cita.findAll({
        where: { fecha, id_veterinario, estado: 'Agendada' },
        attributes: ['hora']
      });

      const horariosOcupados = citas.map(c => c.hora);
      const horariosLibres = todosHorarios.filter(h => !horariosOcupados.includes(h));

      res.json({
        fecha,
        id_veterinario,
        horariosLibres
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = CitaController;
