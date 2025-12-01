"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const tipos = [
      // ============================
      // CATEGORÍA 1: MEDICAMENTOS
      // ============================
      { id_categoria: 1, nombre: "analgesico" },
      { id_categoria: 1, nombre: "antipiretico" },
      { id_categoria: 1, nombre: "antiinflamatorio" },
      { id_categoria: 1, nombre: "antibiotico" },
      { id_categoria: 1, nombre: "antimicotico" },
      { id_categoria: 1, nombre: "antiviral" },
      { id_categoria: 1, nombre: "antiparasitario interno" },
      { id_categoria: 1, nombre: "antiparasitario externo" },
      { id_categoria: 1, nombre: "desparasitante de amplio espectro" },
      { id_categoria: 1, nombre: "antiemetico" },
      { id_categoria: 1, nombre: "antidiarreico" },
      { id_categoria: 1, nombre: "gastroprotector" },
      { id_categoria: 1, nombre: "probiotico" },
      { id_categoria: 1, nombre: "vitaminico" },
      { id_categoria: 1, nombre: "suplemento nutricional" },
      { id_categoria: 1, nombre: "reconstituyente" },
      { id_categoria: 1, nombre: "inmunoestimulante" },
      { id_categoria: 1, nombre: "antihistaminico" },
      { id_categoria: 1, nombre: "ansiolitico veterinario" },
      { id_categoria: 1, nombre: "sedante" },
      { id_categoria: 1, nombre: "anestesico" },
      { id_categoria: 1, nombre: "eutanasico" },
      { id_categoria: 1, nombre: "antiseptico" },
      { id_categoria: 1, nombre: "solucion" },
      { id_categoria: 1, nombre: "corticosteroide" },
      { id_categoria: 1, nombre: "antipruritico" },

      // ============================
      // CATEGORÍA 2: ACCESORIOS
      // ============================
      { id_categoria: 2, nombre: "collar" },
      { id_categoria: 2, nombre: "correa" },
      { id_categoria: 2, nombre: "arnes" },
      { id_categoria: 2, nombre: "placa de identificacion" },
      { id_categoria: 2, nombre: "cama" },
      { id_categoria: 2, nombre: "casa" },
      { id_categoria: 2, nombre: "transportadora" },
      { id_categoria: 2, nombre: "plato" },
      { id_categoria: 2, nombre: "tapete absorbente" },
      { id_categoria: 2, nombre: "alfombra" },
      { id_categoria: 2, nombre: "juguete" },
      { id_categoria: 2, nombre: "dispensador" },
      { id_categoria: 2, nombre: "pelota" },
      { id_categoria: 2, nombre: "cuerda" },
      { id_categoria: 2, nombre: "ropa" },

      // ============================
      // CATEGORÍA 3: ALIMENTO
      // ============================
      { id_categoria: 3, nombre: "pienso" },
      { id_categoria: 3, nombre: "snack" },
      { id_categoria: 3, nombre: "premio de entrenamiento" },
      { id_categoria: 3, nombre: "galleta" },
      { id_categoria: 3, nombre: "golosina dental" },
      { id_categoria: 3, nombre: "alimento para cachorros" },
      { id_categoria: 3, nombre: "alimento para adultos" },
      { id_categoria: 3, nombre: "alimento para senior" },
      { id_categoria: 3, nombre: "alimento para esterilizados" },
      { id_categoria: 3, nombre: "alimento para control de peso" },
      { id_categoria: 3, nombre: "alimento urinario" },
      { id_categoria: 3, nombre: "alimento gastrointestinal" },
      { id_categoria: 3, nombre: "alimento renal" },
      { id_categoria: 3, nombre: "alimento hairball" },
      { id_categoria: 3, nombre: "polvo nutricional" },
      { id_categoria: 3, nombre: "suplemento alimenticio" },

      // ============================
      // CATEGORÍA 4: HIGIENE Y CUIDADO
      // ============================
      { id_categoria: 4, nombre: "shampoo" },
      { id_categoria: 4, nombre: "jabon" },
      { id_categoria: 4, nombre: "talco" },
      { id_categoria: 4, nombre: "peine" },
      { id_categoria: 4, nombre: "guante" },
      { id_categoria: 4, nombre: "pasta dental" },
      { id_categoria: 4, nombre: "toalla de bano" },
      { id_categoria: 4, nombre: "toallitas humedas" },
      { id_categoria: 4, nombre: "repelente" },
      { id_categoria: 4, nombre: "desinfectante" },
      { id_categoria: 4, nombre: "arena aglutinante" },
      { id_categoria: 4, nombre: "removedor olor" },

    ];
    await queryInterface.bulkInsert("tipos_producto", tipos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tipos_producto", null, {});
  },
};
