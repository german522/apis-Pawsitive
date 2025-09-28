const { Vacuna, Mascota, VacunaxMascota, sequelize } = require("../models");

class VacunaRepository {
    async getAll() {
        return await Vacuna.findAll({
            include: [
                { 
                    model: Mascota, 
                    as: 'mascotas',
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }

    async getById(id) {
        return await Vacuna.findByPk(id, {
            include: [
                { 
                    model: Mascota, 
                    as: 'mascotas',
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }

    async create(data) {
        return await Vacuna.create(data);
    }

    async update(id, data) {
        const vacuna = await Vacuna.findByPk(id);
        if (!vacuna) return null;
        return await vacuna.update(data);
    }

    async deleteVacuna(id, transaction) {
        try {
            await Vacuna.destroy({ where: { id }, transaction });
        } catch (error) {
            throw error;
        }
    }

    async getByNombre(nombre) {
        return await Vacuna.findOne({
            where: { nombre },
            include: [
                { 
                    model: Mascota, 
                    as: 'mascotas',
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }

    async getVacunasPorMascota(id_mascota) {
        return await Vacuna.findAll({
            include: [
                {
                    model: Mascota,
                    as: 'mascotas',
                    where: { id: id_mascota },
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }

    async getMascotasVacunadas(id_vacuna) {
        return await Mascota.findAll({
            include: [
                {
                    model: Vacuna,
                    as: 'vacunas',
                    where: { id: id_vacuna },
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }
}

module.exports = new VacunaRepository();