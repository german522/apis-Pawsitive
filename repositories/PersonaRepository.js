const { Persona, Cliente, Veterinario, sequelize } = require("../models");

class PersonaRepository {
    async getAll() {
        return await Persona.findAll({
            include: [
                { model: Cliente, as: 'cliente' },
                { model: Veterinario, as: 'veterinario' }
            ]
        });
    }

    async getById(id) {
        return await Persona.findByPk(id, {
            include: [
                { model: Cliente, as: 'cliente' },
                { model: Veterinario, as: 'veterinario' }
            ]
        });
    }

    async create(data) {
        return await Persona.create(data);
    }

    async update(id, data) {
        const persona = await Persona.findByPk(id);
        if (!persona) return null;
        return await persona.update(data);
    }

    async deletePersona(id, transaction) {
        try {
            // Las relaciones se eliminarán automáticamente por CASCADE
            await Persona.destroy({ where: { id }, transaction });
        } catch (error) {
            throw error;
        }
    }

    async getByCorreo(correo) {
        return await Persona.findOne({ 
            where: { correo },
            include: [
                { model: Cliente, as: 'cliente' },
                { model: Veterinario, as: 'veterinario' }
            ]
        });
    }

    async getPersonasClientes() {
        return await Persona.findAll({
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    required: true // Solo personas que son clientes
                }
            ]
        });
    }

    async getPersonasVeterinarios() {
        return await Persona.findAll({
            include: [
                { 
                    model: Veterinario, 
                    as: 'veterinario',
                    required: true // Solo personas que son veterinarios
                }
            ]
        });
    }
}

module.exports = new PersonaRepository();