'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Vacunas', [
      {
        id: 1,
        nombre: 'Rabia'       
      },
      {
        id: 2,
        nombre: 'Parvovirus'
      },
      {
        id: 3,
        nombre: 'Moquillo'
      },
      {
        id: 4,
        nombre: 'Hepatitis infecciosa canina'
      },
      {
        id: 5,
        nombre: 'Leptospirosis'
      },
      {
        id: 6,
        nombre: 'Bordetella'
      },
      {
        id: 7,
        nombre: 'Triple felina'
      },
      {
        id: 8,
        nombre: 'Leucemia felina'
      },
      {
        id: 9,
        nombre: 'Peritonitis infecciosa felina'
      },
      {
        id: 10,
        nombre: 'Rabia felina'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Vacunas', null, {});
  }
};
