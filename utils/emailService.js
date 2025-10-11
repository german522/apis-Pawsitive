const mailgun = require("mailgun-js");
require("dotenv").config();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

async function enviarCodigoVerificacion(correo, codigo) {
  const data = {
    from: process.env.MAILGUN_FROM,
    to: correo,
    subject: "Código de verificación de tu cuenta",
    html: `
      <div style="font-family:sans-serif">
        <h2>Verificación de correo</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="color:#2e7d32;">${codigo}</h1>
        <p>Ingresa este código en la app o sitio web para confirmar tu cuenta.</p>
      </div>
    `
  };

  try {
    const body = await mg.messages().send(data);
    console.log("✅ Correo enviado:", body);
  } catch (error) {
    console.error("❌ Error al enviar correo:", error.message || error);
    throw error;
  }
}

module.exports = { enviarCodigoVerificacion };
