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
    subject: "🔐 Verifica tu cuenta en Pawsitive",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color:#f9f9f9; padding: 40px 0; text-align:center;">
        <div style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08); padding:30px;">
          <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Pawsitive Logo" style="width:64px; margin-bottom:20px;" />
          <h2 style="color:#2e7d32; margin-bottom:10px;">Verificación de tu cuenta</h2>
          <p style="color:#333; font-size:16px; line-height:1.5; margin-bottom:20px;">
            ¡Hola! Gracias por registrarte en <strong>Pawsitive</strong> 🐾.<br/>
            Usa el siguiente código para verificar tu correo electrónico:
          </p>
          <div style="background-color:#2e7d32; color:#ffffff; display:inline-block; padding:14px 28px; font-size:28px; font-weight:bold; letter-spacing:3px; border-radius:8px; margin:20px 0;">
            ${codigo}
          </div>
          <p style="color:#555; font-size:14px; margin-top:20px;">
            Este código expirará en <strong>15 minutos</strong>.<br/>
            Si tú no solicitaste este registro, puedes ignorar este mensaje.
          </p>
          <hr style="border:none; border-top:1px solid #eee; margin:30px 0;" />
          <p style="color:#aaa; font-size:12px; margin:0;">
            © ${new Date().getFullYear()} Pawsitive. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `
  };

  try {
    const body = await mg.messages().send(data);
    console.log("Correo enviado:", body);
  } catch (error) {
    console.error("Error al enviar correo:", error.message || error);
    throw error;
  }
}

module.exports = { enviarCodigoVerificacion };
