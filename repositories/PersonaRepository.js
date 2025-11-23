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
                    required: true
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
                    required: true
                }
            ]
        });
    }

    async subirImagenPersona(personaId, imageUrl) {
        try {
            const persona = await Persona.findByPk(personaId);
            if (!persona) {
                throw new Error('Persona no encontrada');
            }
            await persona.update({ URL_imagen: imageUrl });
            return { url: imageUrl };
        } catch (error) {
            console.error("Error al actualizar imagen de persona:", error);
            throw error;
        }
    }
    async saveResetToken(personaId, token, expiresAt) {
        const persona = await Persona.findByPk(personaId);
        if (!persona) return null;

        await persona.update({
            reset_token: token,
            reset_token_expires: expiresAt
        });

        return persona;
    }
    async findByResetToken(token) {
        return await Persona.findOne({
            where: { reset_token: token }
        });
    }
    async resetPassword(personaId, newHashedPassword) {
        const persona = await Persona.findByPk(personaId);
        if (!persona) return null;

        await persona.update({
            contrasena: newHashedPassword,
            reset_token: null,
            reset_token_expires: null
        });

        return persona;
    }
}

module.exports = new PersonaRepository();