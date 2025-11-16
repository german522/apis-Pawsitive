const EstadisticasRepository = require("../repositories/EstadisticasRepository");
const ApiResponse = require("../utils/ApiResponse");

const COSTO_CONSULTA = 500;

const EstadisticasController = {
  obtenerTotales: async (req, res) => {
    try {
      const total_clientes = await EstadisticasRepository.contarClientes();
      const total_veterinarios = await EstadisticasRepository.contarVeterinarios();

      return ApiResponse.success("Totales obtenidos.", {
        total_clientes,
        total_veterinarios
      }, res);
    } catch (error) {
      return ApiResponse.error("Error interno del servidor.", res, 500, error.message);
    }
  },

  serviciosPorSemana: async (req, res) => {
    try {
      const rows = await EstadisticasRepository.getServiciosPorSemana();
      const data = rows.map(r => ({
        semana: r.dataValues.semana,
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));
      return ApiResponse.success("Servicios por semana obtenidos.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo servicios por semana.", res, 500, error.message);
    }
  },

  consultasPorSemana: async (req, res) => {
    try {
      const rows = await EstadisticasRepository.getConsultasPorSemana();
      const data = rows.map(r => ({
        semana: r.dataValues.semana,
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));
      return ApiResponse.success("Consultas por semana obtenidas.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo consultas por semana.", res, 500, error.message);
    }
  },

  consultasPorSemanaPorVet: async (req, res) => {
    try {
      const id_veterinario = req.params.id_veterinario || req.user?.tipoId;
      if (!id_veterinario) return ApiResponse.validation("Falta id_veterinario.", null, res);

      const rows = await EstadisticasRepository.getConsultasPorSemanaPorVet(id_veterinario);
      const data = rows.map(r => ({
        semana: r.dataValues.semana,
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));
      return ApiResponse.success("Consultas por semana del veterinario obtenidas.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo consultas por veterinario.", res, 500, error.message);
    }
  },

  vacunasPorSemana: async (req, res) => {
    try {
      const rows = await EstadisticasRepository.getVacunasPorSemana();
      const data = rows.map(r => ({
        semana: r.dataValues.semana,
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));
      return ApiResponse.success("Vacunas por semana obtenidas.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo vacunas por semana.", res, 500, error.message);
    }
  },

  vacunasPorSemanaPorVet: async (req, res) => {
    try {
      const id_veterinario = req.params.id_veterinario || req.user?.tipoId;
      if (!id_veterinario) return ApiResponse.validation("Falta id_veterinario.", null, res);

      const rows = await EstadisticasRepository.getVacunasPorSemanaPorVet(id_veterinario);
      const data = rows.map(r => ({
        semana: r.dataValues.semana,
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));
      return ApiResponse.success("Vacunas por semana del veterinario obtenidas.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo vacunas por veterinario.", res, 500, error.message);
    }
  },

  gananciasConsultasPorSemana: async (req, res) => {
    try {
      const id_veterinario = req.params.id_veterinario || req.user?.tipoId;
      if (!id_veterinario) return ApiResponse.validation("Falta id_veterinario.", null, res);

      const rows = await EstadisticasRepository.getGananciasConsultasPorSemana(id_veterinario);
      const data = rows.map(r => {
        const cantidad = parseInt(r.dataValues.cantidad_consultas, 10);
        return {
          semana: r.dataValues.semana,
          cantidad_consultas: cantidad,
          ganancias: cantidad * COSTO_CONSULTA
        };
      });

      return ApiResponse.success("Ganancias por consultas por semana obtenidas.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo ganancias por consultas.", res, 500, error.message);
    }
  },

  gananciasServiciosPorSemana: async (req, res) => {
    try {
      const id_veterinario = req.params.id_veterinario || req.user?.tipoId;
      if (!id_veterinario) return ApiResponse.validation("Falta id_veterinario.", null, res);

      const rows = await EstadisticasRepository.getGananciasServiciosPorSemana(id_veterinario);
      const data = rows.map(row => ({
        semana: row.dataValues.semana,
        total_ganancias: Number(row.dataValues.total_ganancias)
      }));

      return ApiResponse.success("Ganancias por servicios por semana obtenidas.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo ganancias por servicios.", res, 500, error.message);
    }
  },

  gananciasTotales: async (req, res) => {
    try {
      const id_veterinario = req.user.tipoId;
      if (!id_veterinario) return ApiResponse.validation("No se encontró id del veterinario en el token.", null, res);
      const data = await EstadisticasRepository.getGananciasTotales(id_veterinario, COSTO_CONSULTA);
      return ApiResponse.success("Ganancias totales obtenidas.", data, res);
    } catch (error) {
      return ApiResponse.error("Error obteniendo ganancias totales.", res, 500, error.message);
    }
  },

  cantidadPorTipoServicio: async (req, res) => {
    try {
      const rows = await EstadisticasRepository.getCantidadPorTipoServicio();

      const data = rows.map(r => ({
        id_tipo_servicio: r.dataValues.id_tipo_servicio,
        nombre: r.tipo_servicio?.nombre,
        descripcion: r.tipo_servicio?.descripcion,
        costo: Number(r.tipo_servicio?.costo),
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));

      return ApiResponse.success("Cantidad por tipo de servicio obtenida.", data, res);
    } catch (error) {
      console.error("Error cantidadPorTipoServicio:", error);
      return ApiResponse.error("Error obteniendo cantidad por tipo de servicio.", res, 500, error.message);
    }
  },

  // Cantidad de cada tipo de servicio por semana
  cantidadPorTipoServicioPorSemana: async (req, res) => {
    try {
      const rows = await EstadisticasRepository.getCantidadPorTipoServicioPorSemana();

      const data = rows.map(r => ({
        semana: r.dataValues.semana,
        id_tipo_servicio: r.dataValues.id_tipo_servicio,
        nombre: r.tipo_servicio?.nombre,
        descripcion: r.tipo_servicio?.descripcion,
        costo: Number(r.tipo_servicio?.costo),
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));

      return ApiResponse.success("Cantidad por tipo de servicio por semana obtenida.", data, res);
    } catch (error) {
      console.error("Error cantidadPorTipoServicioPorSemana:", error);
      return ApiResponse.error("Error obteniendo cantidad por tipo de servicio por semana.", res, 500, error.message);
    }
  },

  // Cantidad de cada tipo de servicio por veterinario y por semana
  cantidadPorTipoServicioPorVetYSemana: async (req, res) => {
    try {
      const id_veterinario = req.params.id_veterinario || req.user?.tipoId;
      if (!id_veterinario) return ApiResponse.validation("Falta id_veterinario.", null, res);

      const rows = await EstadisticasRepository.getCantidadPorTipoServicioPorVetYSemana(id_veterinario);

      const data = rows.map(r => ({
        semana: r.dataValues.semana,
        id_tipo_servicio: r.dataValues.id_tipo_servicio,
        nombre: r.tipo_servicio?.nombre,
        descripcion: r.tipo_servicio?.descripcion,
        costo: Number(r.tipo_servicio?.costo),
        cantidad: parseInt(r.dataValues.cantidad, 10)
      }));

      return ApiResponse.success("Cantidad por tipo de servicio por veterinario y semana obtenida.", data, res);
    } catch (error) {
      console.error("Error cantidadPorTipoServicioPorVetYSemana:", error);
      return ApiResponse.error("Error obteniendo cantidad por tipo de servicio por veterinario y semana.", res, 500, error.message);
    }
  }
};

module.exports = EstadisticasController;
