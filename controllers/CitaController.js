const { Cita, Mascota, Persona, Veterinario, Cliente } = require('../models');

const CitaController = {
  listarCitas: async (req, res) => {
  try {
    const { user } = req;
    let filtro = {};
    if (user.tipo === 'cliente') {
      filtro.id_cliente = user.id; 
    } else if (user.tipo === 'veterinario') {
      if (user.veterinario && user.veterinario.id){
        filtro.id_veterinario = user.veterinario.id; 
      }
    } else {
      return res.status(403).json({ error: 'No tienes permisos para ver citas.' });
    }

    const citas = await Cita.findAll({
      where: filtro,
      include: [
        {
          model: Mascota,
          attributes: [
            'nombre', 'especie', 'raza', 'sexo', 'color', 
            'fecha_nacimiento', 'peso', 'URL_imagen'
          ]
        },
        {
          model: Persona,
          as: 'cliente',
          attributes: ['nombre', 'correo']
        },
        { 
          model: Veterinario,
          include: { 
            model: Persona, 
            as: 'persona', 
            attributes: ['nombre'] 
          }
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    const citasFormateadas = citas.map(cita => {
      const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);
      const opcionesFecha = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      const opcionesHora = { hour: '2-digit', minute: '2-digit' };

      return {
        id: cita.id,
        fecha: fechaHora.toLocaleDateString('es-MX', opcionesFecha),
        hora: fechaHora.toLocaleTimeString('es-MX', opcionesHora),
        estado: cita.estado || 'Pendiente',
        motivo: cita.motivo,
        mascota: cita.Mascota ? {
          nombre: cita.Mascota.nombre,
          especie: cita.Mascota.especie,
          raza: cita.Mascota.raza,
          sexo: cita.Mascota.sexo,
          color: cita.Mascota.color,
          fecha_nacimiento: cita.Mascota.fecha_nacimiento,
          peso: cita.Mascota.peso,
          URL_imagen: cita.Mascota.URL_imagen
        } : null,
        cliente: cita.cliente ? {
          nombre: cita.cliente.nombre,
          correo: cita.cliente.correo
        } : null,
        veterinario: cita.Veterinario && cita.Veterinario.persona ? {
          nombre: cita.Veterinario.persona.nombre
        } : null,
        proximaCita: fechaHora > new Date()
      };
    });

    res.json(citasFormateadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

  agendarCita: async (req, res) => {
    try {
      const { fecha, hora, motivo, id_mascota, id_veterinario } = req.body;

      const mascota = await Mascota.findOne({
        where: { id: id_mascota },
        include: { model: Cliente, as: 'cliente' }
      });

      if (!mascota) {
        return res.status(404).json({ message: 'Mascota no encontrada' });
      }

      if (!mascota.cliente || mascota.cliente.id !== req.user.tipoId) {
  return res.status(403).json({ 
    message: 'No puedes agendar citas para esta mascota (o no eres el dueño).' 
  });
}

      const existeCita = await Cita.findOne({
        where: { fecha, hora, id_veterinario, estado: 'Agendada' }
      });

      if (existeCita) {
        return res.status(400).json({ message: 'Horario no disponible' });
      }

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

  cancelarCita: async (req, res) => {
  try { 
    const { id } = req.params;
    const cita = await Cita.findByPk(id);

    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Solo clientes dueños pueden cancelar
    if (req.user.tipo === 'cliente' && cita.id_cliente !== req.user.id) {
      return res.status(403).json({ message: 'No puedes cancelar esta cita' });
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
