const { VacunaxMascota, Mascota, Vacuna, Cliente, Persona, sequelize } = require("../models");

class VacunaxMascotaRepository {
    async getAll() {
        return await VacunaxMascota.findAll({
            include: [
                { 
                    model: Mascota, 
                    as: 'mascota',
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            include: [{ model: Persona, as: 'persona' }]
                        }
                    ]
                },
                { 
                    model: Vacuna, 
                    as: 'vacuna' 
                }
            ],
            order: [['fecha_aplicacion', 'DESC']]
        });
    }

    async getById(id) {
        return await VacunaxMascota.findByPk(id, {
            include: [
                { 
                    model: Mascota, 
                    as: 'mascota',
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            include: [{ model: Persona, as: 'persona' }]
                        }
                    ]
                },
                { 
                    model: Vacuna, 
                    as: 'vacuna' 
                }
            ]
        });
    }

    async create(data) {
        return await VacunaxMascota.create(data);
    }

    async update(id, data) {
        const vacunaxMascota = await VacunaxMascota.findByPk(id);
        if (!vacunaxMascota) return null;
        return await vacunaxMascota.update(data);
    }

    async deleteVacunaxMascota(id, transaction) {
        try {
            await VacunaxMascota.destroy({ where: { id }, transaction });
        } catch (error) {
            throw error;
        }
    }

    async getByMascotaId(id_mascota) {
        return await VacunaxMascota.findAll({
            where: { id_mascota },
            include: [
                { 
                    model: Mascota, 
                    as: 'mascota' 
                },
                { 
                    model: Vacuna, 
                    as: 'vacuna' 
                }
            ],
            order: [['fecha_aplicacion', 'DESC']]
        });
    }

    async getByVacunaId(id_vacuna) {
        return await VacunaxMascota.findAll({
            where: { id_vacuna },
            include: [
                { 
                    model: Mascota, 
                    as: 'mascota',
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            include: [{ model: Persona, as: 'persona' }]
                        }
                    ]
                },
                { 
                    model: Vacuna, 
                    as: 'vacuna' 
                }
            ],
            order: [['fecha_aplicacion', 'DESC']]
        });
    }

    async getHistorialCompleto(id_mascota) {
        return await VacunaxMascota.findAll({
            where: { id_mascota },
            include: [
                { 
                    model: Vacuna, 
                    as: 'vacuna' 
                }
            ],
            order: [['fecha_aplicacion', 'ASC']]
        });
    }
}

module.exports = new VacunaxMascotaRepository();