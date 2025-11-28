const { Cita, Mascota, Persona, Veterinario, Cliente } = require('../models');
const { enviarCorreoCitaAgendada, enviarCorreoCitaCancelada } = require('../utils/emailService');

async function cargarCitaConDatosCorreo(idCita, overrides = {}) {
  const cita = await Cita.findByPk(idCita, {
    include: [
      { model: Mascota, attributes: ['id', 'nombre'] },
      { model: Persona, as: 'cliente', attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'correo'] },
      { 
        model: Veterinario,
        include: [{ model: Persona, as: 'persona', attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'correo'] }]
      }
    ]
  });
  if (!cita) return null;

  // Nombres
  const clienteNombre = [cita.cliente?.nombre, cita.cliente?.apellido_paterno, cita.cliente?.apellido_materno].filter(Boolean).join(' ');
  const veterinarioNombre = [cita.Veterinario?.persona?.nombre, cita.Veterinario?.persona?.apellido_paterno, cita.Veterinario?.persona?.apellido_materno].filter(Boolean).join(' ');

  // Fecha/hora formateadas
  const dt = new Date(`${cita.fecha}T${cita.hora}`);
  const fecha = dt.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const hora  = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // Mascota (con overrides y fallback a query si viene vacío)
  let mascotaNombre = overrides.mascotaNombre ?? cita.Mascota?.nombre ?? '';
  if (!mascotaNombre) {
    const m = await Mascota.findByPk(cita.id_mascota, { attributes: ['nombre'] });
    mascotaNombre = m?.nombre ?? '';
  }

  return {
    toCliente: cita.cliente?.correo || null,
    toVeterinario: cita.Veterinario?.persona?.correo || null,
    clienteNombre,
    veterinarioNombre,
    mascotaNombre,
    fecha,
    hora,
    motivo: cita.motivo || ''
  };
}

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
            // NO ponemos 'as', dejamos que Sequelize use su nombre por defecto (Mascotum)
            attributes: [
              'id', 
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

      const citasFormateadas = citas.map(citaInstance => {
        // Convertimos a JSON plano para ver las propiedades reales
        const cita = citaInstance.toJSON();
        
        // CORRECCIÓN CLAVE: Sequelize renombró la propiedad a 'Mascotum'
        const datosMascota = cita.Mascotum || cita.Mascota || cita.mascota;

        const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);
        const opcionesFecha = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const opcionesHora = { hour: '2-digit', minute: '2-digit' };

        return {
          id: cita.id,
          fecha: fechaHora.toLocaleDateString('es-MX', opcionesFecha),
          hora: fechaHora.toLocaleTimeString('es-MX', opcionesHora),
          estado: cita.estado || 'Pendiente',
          motivo: cita.motivo,
          
          mascota: datosMascota ? {
            id: datosMascota.id,
            nombre: datosMascota.nombre,
            especie: datosMascota.especie,
            raza: datosMascota.raza,
            sexo: datosMascota.sexo,
            color: datosMascota.color,
            fecha_nacimiento: datosMascota.fecha_nacimiento,
            peso: datosMascota.peso,
            URL_imagen: datosMascota.URL_imagen
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
      console.error(error);
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
        return res.status(403).json({ message: 'No puedes agendar citas para esta mascota (o no eres el dueño).' });
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

try {
  const payload = await cargarCitaConDatosCorreo(nuevaCita.id, { mascotaNombre: mascota.nombre });
  if (payload) {
    await enviarCorreoCitaAgendada({ data: payload });
  }
} catch (err) {
  console.error('No se pudo enviar correo de cita agendada:', err?.message || err);
}

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

      if (req.user.tipo === 'cliente' && cita.id_cliente !== req.user.id) {
        return res.status(403).json({ message: 'No puedes cancelar esta cita' });
      }

      cita.estado = 'Cancelada';
      await cita.save();

      try {
        const payload = await cargarCitaConDatosCorreo(cita.id);
        if (payload) {
          await enviarCorreoCitaCancelada({ data: payload });
        }
      } catch (err) {
        console.error('No se pudo enviar correo de cita cancelada:', err?.message || err);
      }

      // === Tu respuesta actual (SIN CAMBIOS) ===
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
