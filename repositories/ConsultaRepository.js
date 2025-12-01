const { Consulta, Cita, Mascota, Persona, Veterinario, ProductoConsulta, Producto} = require("../models");

class ConsultaRepository {
  async crearConsulta(data) {
    return await Consulta.create(data);
  }

  async obtenerPorMascota(id_mascota) {
  return await Consulta.findAll({
    include: [
      {
        model: Cita,
        as: "cita",
        include: [
          {
            model: Mascota,
            as: "Mascotum",
            attributes: ["nombre"]
          },
          {
            model: Persona,
            as: "cliente",
            attributes: ["nombre", "correo"]
          },
          {
            model: Veterinario,
            include: [
              {
                model: Persona,
                as: "persona",
                attributes: ["nombre", "correo"],
              },
            ],
          },
        ],
      },
    ],
    where: { id_mascota }
  });
}



  async obtenerPorId(id) {
    return await Consulta.findByPk(id, {
      include: [
        {
          model: Cita,
          as: "cita",
          include: [
            { model: Mascota, attributes: ["nombre"] },
            { model: Persona, as: "cliente", attributes: ["nombre", "correo"] },
            {
              model: Veterinario,
              include: {
                model: Persona,
                as: "persona",
                attributes: ["nombre", "correo"],
              },
            },
          ],
        },
      ],
    });
  }

  async obtenerPorCita(id_cita) {
    return await Consulta.findOne({
      where: { id_cita },
      include: [{ model: Cita, as: "cita" }],
    });
  }

  async listarConsultasPorUsuario(tipoId) {
  return await Consulta.findAll({
    where: { id_veterinario: tipoId }, 
    include: [
      {
        model: Cita,
        as: "cita",
        include: [
          { model: Mascota, attributes: ["nombre"] },
          { model: Persona, as: "cliente", attributes: ["nombre"] },
          {
            model: Veterinario,
            include: [
              { model: Persona, as: "persona", attributes: ["nombre"] },
            ],
          },
        ],
      },
    ],
  });
}

  async obtenerPorFolioConProductos(folioReceta) {
      return await Consulta.findOne({
          where: { folio_receta: folioReceta },
          include: [
              {
                  model: ProductoConsulta,
                  as: 'productos_recetados', 
                  attributes: ['id', 'id_producto', 'dosis', 'cantidad_autorizada', 'cantidad_dispensada'],
                  include: [
                      {
                          model: Producto,
                          as: 'producto', 
                          attributes: ['id', 'nombre', 'unidad_medida']
                      }
                  ]
              },
              {
                  model: Mascota,
                  as: 'mascota',
                  attributes: ['nombre', 'especie', 'raza']
              },
          ],
      });
  }

  async marcarEstadoReceta(idConsulta, nuevoEstado, transaction) {
      return await Consulta.update(
          { estado_receta: nuevoEstado },
          { where: { id: idConsulta }, transaction }
      );
  }

}

module.exports = new ConsultaRepository();