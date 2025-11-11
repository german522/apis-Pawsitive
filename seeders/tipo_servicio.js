"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("tiposservicio", [
      // 🩺 Servicios médicos generales
      {
        nombre: "Vacunación",
        descripcion:
          "Aplicación de vacunas preventivas según especie, edad y calendario veterinario.",
        costo: 300.0,
      },
      {
        nombre: "Desparasitación",
        descripcion:
          "Tratamiento antiparasitario interno o externo, preventivo o correctivo.",
        costo: 250.0,
      },
      {
        nombre: "Control de peso y nutrición",
        descripcion:
          "Evaluación del estado físico y diseño de un plan alimenticio personalizado.",
        costo: 200.0,
      },
      {
        nombre: "Consulta de seguimiento",
        descripcion:
          "Revisión posterior a un tratamiento o cirugía para evaluar progreso.",
        costo: 150.0,
      },
      {
        nombre: "Análisis de laboratorio",
        descripcion:
          "Exámenes de sangre, orina y heces para diagnóstico y control de salud.",
        costo: 450.0,
      },
      {
        nombre: "Radiografía",
        descripcion:
          "Estudio por imagen para detección de fracturas, cálculos o malformaciones.",
        costo: 500.0,
      },
      {
        nombre: "Ultrasonido",
        descripcion:
          "Diagnóstico por ultrasonido abdominal o reproductivo.",
        costo: 600.0,
      },
      {
        nombre: "Hospitalización",
        descripcion:
          "Internamiento para cuidados médicos intensivos o tratamientos prolongados.",
        costo: 800.0,
      },

      // ✂️ Servicios estéticos y de bienestar
      {
        nombre: "Baño y corte de pelo",
        descripcion:
          "Servicio estético que incluye baño, secado, cepillado y corte de pelo según raza.",
        costo: 350.0,
      },
      {
        nombre: "Corte de uñas",
        descripcion:
          "Recorte seguro de uñas para evitar lesiones y molestias.",
        costo: 100.0,
      },
      {
        nombre: "Limpieza dental",
        descripcion:
          "Profilaxis dental veterinaria para eliminar sarro y prevenir enfermedades bucales.",
        costo: 700.0,
      },
      {
        nombre: "Limpieza de oídos",
        descripcion:
          "Limpieza profunda del canal auditivo para prevenir infecciones.",
        costo: 120.0,
      },
      {
        nombre: "Tratamiento antipulgas",
        descripcion:
          "Aplicación de pipetas o baños medicados para eliminar pulgas y garrapatas.",
        costo: 280.0,
      },

      // 🧬 Servicios especializados
      {
        nombre: "Esterilización / Castración",
        descripcion:
          "Cirugía preventiva para controlar la reproducción y mejorar la salud del animal.",
        costo: 1000.0,
      },
      {
        nombre: "Microchip o identificación",
        descripcion:
          "Colocación de microchip subcutáneo o placa identificatoria con registro.",
        costo: 400.0,
      },
      {
        nombre: "Certificados de salud",
        descripcion:
          "Emisión de certificados oficiales de salud para viajes o competencias.",
        costo: 250.0,
      },
      {
        nombre: "Fisioterapia o rehabilitación",
        descripcion:
          "Tratamientos terapéuticos para recuperación de movilidad tras lesiones o cirugías.",
        costo: 800.0,
      },
      {
        nombre: "Atención de urgencias",
        descripcion:
          "Atención médica inmediata ante accidentes o enfermedades graves.",
        costo: 1200.0,
      },

      // 🏠 Servicios complementarios
      {
        nombre: "Guardería",
        descripcion:
          "Cuidado diurno supervisado para mascotas mientras sus dueños trabajan.",
        costo: 500.0,
      },
      {
        nombre: "Pensión",
        descripcion:
          "Hospedaje temporal para mascotas con alimentación y supervisión veterinaria.",
        costo: 900.0,
      },
      {
        nombre: "Transporte veterinario",
        descripcion:
          "Servicio de traslado seguro de mascotas hacia y desde la clínica.",
        costo: 350.0,
      },
      {
        nombre: "Adiestramiento",
        descripcion:
          "Entrenamiento básico o avanzado para mejorar la conducta y obediencia.",
        costo: 700.0,
      },
      {
        nombre: "Asesoría conductual",
        descripcion:
          "Evaluación y orientación profesional sobre problemas de comportamiento.",
        costo: 450.0,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tiposservicio", null, {});
  },
};
