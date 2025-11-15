const EstadisticasRepository = require("../repositories/EstadisticasRepository");
const ApiResponse = require("../utils/ApiResponse");

const EstadisticasController = {
    obtenerTotales: async (req, res) => {
        try {
            const total_clientes = await EstadisticasRepository.contarClientes();
            const total_veterinarios = await EstadisticasRepository.contarVeterinarios();

        return ApiResponse.success("Totales obtenidos.", {
            total_clientes,
            total_veterinarios
        }, res);
        } 
        catch (error) {
            return ApiResponse.error("Error interno del servidor.", res, 500, error.message);
        }
    }
};
module.exports = EstadisticasController;