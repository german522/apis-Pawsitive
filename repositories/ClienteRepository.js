const { Cliente, Persona, Mascota, sequelize } = require("../models");

class ClienteRepository {
    async getAll() {
        return await Cliente.findAll({
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                },
                { 
                    model: Mascota, 
                    as: 'mascotas' 
                }
            ]
        });
    }

    async getById(id) {
        return await Cliente.findByPk(id, {
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                },
                { 
                    model: Mascota, 
                    as: 'mascotas' 
                }
            ]
        });
    }

    async create(data) {
        return await Cliente.create(data);
    }

    async update(id, data) {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) return null;
        return await cliente.update(data);
    }

    async deleteCliente(id, transaction) {
        try {
            await Cliente.destroy({ where: { id }, transaction });
        } catch (error) {
            throw error;
        }
    }

    async getByPersonaId(id_persona) {
        return await Cliente.findOne({
            where: { id_persona },
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                },
                { 
                    model: Mascota, 
                    as: 'mascotas' 
                }
            ]
        });
    }

    async getClientesConMascotas() {
        return await Cliente.findAll({
            include: [
                { 
                    model: Persona, 
                    as: 'persona' 
                },
                { 
                    model: Mascota, 
                    as: 'mascotas',
                    required: true // Solo clientes que tienen mascotas
                }
            ]
        });
    }

    async createClienteCompleto(personaData, clienteData, transaction) {
        try {
            // Crear persona primero
            const persona = await Persona.create(personaData, { transaction });
            
            // Crear cliente asociado
            const cliente = await Cliente.create({
                ...clienteData,
                id_persona: persona.id
            }, { transaction });

            return await this.getById(cliente.id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ClienteRepository();