const { Mascota, Cliente, Persona, Vacuna, VacunaxMascota, sequelize } = require("../models");

class MascotaRepository {
    async getAll() {
        return await Mascota.findAll({
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    include: [
                        { model: Persona, as: 'persona' }
                    ]
                },
                { 
                    model: Vacuna, 
                    as: 'vacunas',
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }

    async getById(id) {
        return await Mascota.findByPk(id, {
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    include: [
                        { model: Persona, as: 'persona' }
                    ]
                },
                { 
                    model: Vacuna, 
                    as: 'vacunas',
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }

    async create(data) {
        return await Mascota.create(data);
    }

    async update(id, data) {
        const mascota = await Mascota.findByPk(id);
        if (!mascota) return null;
        return await mascota.update(data);
    }

    async deleteMascota(id, transaction) {
        try {
            await Mascota.destroy({ where: { id }, transaction });
        } catch (error) {
            throw error;
        }
    }

    async getByClienteId(id_cliente) {
        return await Mascota.findAll({
            where: { id_cliente },
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    include: [
                        { model: Persona, as: 'persona' }
                    ]
                },
                { 
                    model: Vacuna, 
                    as: 'vacunas',
                    through: { attributes: ['fecha_aplicacion'] }
                }
            ]
        });
    }

    async getByEspecie(especie) {
        return await Mascota.findAll({
            where: { especie },
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    include: [
                        { model: Persona, as: 'persona' }
                    ]
                }
            ]
        });
    }

    async getMascotasPorRaza(raza) {
        return await Mascota.findAll({
            where: { raza },
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    include: [
                        { model: Persona, as: 'persona' }
                    ]
                }
            ]
        });
    }

    async agregarVacuna(id_mascota, id_vacuna, fecha_aplicacion, transaction) {
        try {
            return await VacunaxMascota.create({
                id_mascota,
                id_vacuna,
                fecha_aplicacion
            }, { transaction });
        } catch (error) {
            throw error;
        }
    }

    async getHistorialVacunas(id_mascota) {
        return await VacunaxMascota.findAll({
            where: { id_mascota },
            include: [
                { model: Vacuna, as: 'vacuna' },
                { model: Mascota, as: 'mascota' }
            ],
            order: [['fecha_aplicacion', 'DESC']]
        });
    }
}

module.exports = new MascotaRepository();