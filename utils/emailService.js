require('dotenv').config();
const { Resend } = require('resend');

const provider = process.env.EMAIL_PROVIDER || 'resend';
const FROM = process.env.MAIL_FROM;

if (!process.env.RESEND_API_KEY) throw new Error('Falta RESEND_API_KEY');
if (!FROM) throw new Error('Falta MAIL_FROM (ej. notificaciones@pawsitivevibes.com.mx)');

const resend = new Resend(process.env.RESEND_API_KEY);

function buildVerificationHtml(code) {
  return `
  <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
              background-color:#f9faf9;
              padding:32px;
              border-radius:12px;
              max-width:480px;
              margin:auto;
              border:1px solid #e3e3e3;
              box-shadow:0 3px 10px rgba(0,0,0,0.05);">

    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://res.cloudinary.com/dzxi5k6ez/image/upload/v1760911319/PAWSITIVE_VIBES_2_nt3js7.png" alt="PawsitiveVibes Logo"
           style="width:90px;height:90px;object-fit:contain;border-radius:50%;"/>
    </div>

    <h2 style="color:#2E7D32;text-align:center;margin:0;font-size:22px;">
      🐾 Verificación de correo
    </h2>

    <p style="color:#444;text-align:center;margin:16px 0 8px;font-size:15px;">
      ¡Hola! Gracias por registrarte en <strong>PawsitiveVibes</strong>.<br>
      Ingresa el siguiente código para confirmar tu cuenta:
    </p>

    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;
                   background-color:#A5D6A7;
                   color:#1B5E20;
                   font-weight:bold;
                   font-size:28px;
                   letter-spacing:6px;
                   padding:10px 24px;
                   border-radius:10px;
                   border:2px solid #81C784;">
        ${code}
      </span>
    </div>

    <p style="color:#666;text-align:center;margin:8px 0 24px;font-size:14px;">
      Este código expira en <strong>15 minutos</strong>.<br>
      Si no realizaste este registro, puedes ignorar este correo.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

    <p style="text-align:center;color:#888;font-size:12px;">
      <strong style="color:#FFB74D;">PawsitiveVibes 🐾</strong><br>
      Cuidamos a tus mascotas con amor y confianza 💚<br>
      <span style="color:#A5A5A5;">no-reply@notificaciones.pawsitivevibes.com.mx</span>
    </p>
  </div>
  `;
}


/**
 * Envia un correo con código de verificación.
 * @param {Object} params
 * @param {string|string[]} params.to - destinatario(s)
 * @param {string} params.code - código de verificación
 * @param {string} [params.idempotencyKey] - opcional, para evitar duplicados
 */
async function enviarCorreoVerificacion({ to, code, idempotencyKey }) {
  if (provider !== 'resend') {
    throw new Error(`EMAIL_PROVIDER no soportado: ${provider}`);
  }
  if (!to) throw new Error('enviarCorreoVerificacion: falta "to"');
  if (!code) throw new Error('enviarCorreoVerificacion: falta "code"');

  try {
    const res = await resend.emails.send({
      from: `PawsitiveVibes <${FROM}>`,
      to,
      subject: 'Código de verificación',
      html: buildVerificationHtml(code),
      text: `Tu código de verificación es: ${code}. Expira en 15 minutos.`,
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      // opcional:
      // reply_to: 'contacto@pawsitivevibes.com.mx'
    });
    // console.log('Resend message id:', res?.data?.id);
    return res;
  } catch (error) {
    const details = error?.response?.data || error?.message || error;
    console.error('Error enviando correo (Resend):', details);
    throw new Error('No se pudo enviar el correo de verificación');
  }
}

module.exports = { enviarCorreoVerificacion };