module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('consultas', 'id_veterinario', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'veterinarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('consultas', 'id_veterinario');
  }
};
