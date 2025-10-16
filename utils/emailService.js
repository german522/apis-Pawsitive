const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreoVerificacion = async (correo, codigo) => {
  try {
    await resend.emails.send({
      from: "Tu Proyecto <onboarding@resend.dev>", // Debe estar verificado en Resend
      to: correo,
      subject: "Verifica tu correo electrónico",
      html: `
        <h2>Verificación de correo</h2>
        <p>Tu código de verificación es:</p>
        <h1>${codigo}</h1>
        <p>Expira en 10 minutos.</p>
      `
    });
    console.log(`Correo enviado a ${correo}`);
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw new Error("No se pudo enviar el correo de verificación.");
  }
};

module.exports = { enviarCorreoVerificacion };
