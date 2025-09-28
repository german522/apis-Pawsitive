const { Veterinario, Persona, sequelize } = require("../models");

class VeterinarioRepository {
    async getAll() {
        return await Veterinario.findAll({
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                }
            ]
        });
    }

    async getById(id) {
        return await Veterinario.findByPk(id, {
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                }
            ]
        });
    }

    async create(data) {
        return await Veterinario.create(data);
    }

    async update(id, data) {
        const veterinario = await Veterinario.findByPk(id);
        if (!veterinario) return null;
        return await veterinario.update(data);
    }

    async deleteVeterinario(id, transaction) {
        try {
            await Veterinario.destroy({ where: { id }, transaction });
        } catch (error) {
            throw error;
        }
    }

    async getByPersonaId(id_persona) {
        return await Veterinario.findOne({
            where: { id_persona },
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                }
            ]
        });
    }

    async getByCedula(cedula) {
        return await Veterinario.findOne({
            where: { cedula },
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                }
            ]
        });
    }

    async getByEspecialidad(especialidad) {
        return await Veterinario.findAll({
            where: { especialidad },
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                }
            ]
        });
    }

    async createVeterinarioCompleto(personaData, veterinarioData, transaction) {
        try {
            // Crear persona primero
            const persona = await Persona.create(personaData, { transaction });
            
            // Crear veterinario asociado
            const veterinario = await Veterinario.create({
                ...veterinarioData,
                id_persona: persona.id
            }, { transaction });

            return await this.getById(veterinario.id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new VeterinarioRepository();