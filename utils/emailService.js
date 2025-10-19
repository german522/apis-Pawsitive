require('dotenv').config();
const { Resend } = require('resend');

const provider = process.env.EMAIL_PROVIDER || 'resend';
const FROM = process.env.MAIL_FROM;

if (!process.env.RESEND_API_KEY) throw new Error('Falta RESEND_API_KEY');
if (!FROM) throw new Error('Falta MAIL_FROM (ej. notificaciones@pawsitivevibes.com.mx)');

const resend = new Resend(process.env.RESEND_API_KEY);

function buildVerificationHtml(code) {
  return `
    <div style="font-family:Arial,sans-serif;padding:16px;line-height:1.5">
      <h2 style="margin:0 0 8px">Verificación de correo</h2>
      <p>Tu código de verificación es:</p>
      <h1 style="letter-spacing:4px;margin:8px 0 16px">${code}</h1>
      <p style="color:#666">Este código expira en 15 minutos.</p>
      <hr><small>PawsitiveVibes • notificaciones</small>
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