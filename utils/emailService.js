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

function buildPasswordResetHtml(resetLink) {
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
      🐾 Recuperación de contraseña
    </h2>

    <p style="color:#444;text-align:center;margin:16px 0 8px;font-size:15px;">
      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>PawsitiveVibes</strong>.
    </p>

    <p style="color:#444;text-align:center;margin:8px 0 16px;font-size:14px;">
      Haz clic en el siguiente botón para establecer una nueva contraseña:
    </p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${resetLink}"
         style="display:inline-block;
                background-color:#43A047;
                color:#ffffff;
                text-decoration:none;
                font-weight:bold;
                font-size:15px;
                padding:12px 28px;
                border-radius:24px;">
        Restablecer contraseña
      </a>
    </div>

    <p style="color:#666;text-align:center;margin:8px 0 24px;font-size:13px;">
      Este enlace será válido por <strong>1 hora</strong>.<br>
      Si tú no solicitaste este cambio, puedes ignorar este mensaje.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

    <p style="text-align:center;color:#888;font-size:12px;">
      <strong style="color:#FFB74D;">PawsitiveVibes 🐾</strong><br>
      Cuidamos a tus mascotas con amor y confianza 💚<br>
      <span style="color:#A5A5A5;">${FROM}</span>
    </p>
  </div>
  `;
}

function buildRecetaGeneradaHtmlCliente(d) {
    return `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                 background-color:#e3f2fd; /* Azul claro */
                 padding:32px;
                 border-radius:12px;
                 max-width:550px;
                 margin:auto;
                 border:1px solid #bbdefb;
                 box-shadow:0 4px 12px rgba(0,0,0,0.08);">

        <div style="text-align:center;margin-bottom:24px;">
            <img src="https://res.cloudinary.com/dzxi5k6ez/image/upload/v1760911319/PAWSITIVE_VIBES_2_nt3js7.png" alt="PawsitiveVibes Logo"
                 style="width:80px;height:80px;object-fit:contain;border-radius:50%;"/>
        </div>

        <h2 style="color:#1565C0;text-align:center;margin:0 0 8px;font-size:24px;">
            📄 ¡Receta Médica Lista!
        </h2>

        <p style="color:#444;text-align:center;margin:16px 0 24px;font-size:16px;">
            Hola <b>${d.clienteNombre}</b>. Tu veterinario ha finalizado la consulta de <b>${d.mascotaNombre}</b> y ha emitido una receta.
            Aquí está el folio para que puedas surtir tus productos:
        </p>
        
        <div style="background:#ffffff;border:1px solid #e1f5fe;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:14px;color:#666;">
                Folio de Receta Único:
            </p>
            <span style="display:inline-block;
                         background-color:#E3F2FD;
                         color:#1565C0; /* Azul oscuro */
                         font-weight:bold;
                         font-size:26px;
                         letter-spacing:3px;
                         padding:12px 20px;
                         border-radius:10px;
                         border:1px solid #90CAF9;">
                ${d.folio_receta}
            </span>
            <p style="margin:16px 0 0;font-size:14px;color:#666;">
                Esta receta es válida hasta el <b>${d.fecha_expiracion}</b>.
            </p>
        </div>
        
        <p style="color:#444;font-size:15px;text-align:center;margin:0;">
            Utiliza este folio en nuestra tienda en línea o preséntalo en nuestro punto de venta.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

        <p style="text-align:center;color:#888;font-size:12px;">
            <strong style="color:#64B5F6;">PawsitiveVibes 🐾</strong><br>
            <span style="color:#A5A5A5;">${FROM}</span>
        </p>
    </div>
    `;
}

async function enviarCorreoRecetaGenerada({ data }) {
    if (provider !== 'resend') {
        console.warn(`EMAIL_PROVIDER no es 'resend', omitiendo envío de correo de receta.`);
        return;
    }
    if (!data.toCliente || !data.folio_receta) {
        console.error('enviarCorreoRecetaGenerada: Faltan datos críticos (toCliente o folio_receta).');
        return;
    }

    const subjectCliente = `Tu Receta Médica de PawsitiveVibes • ${data.mascotaNombre}`;
    const textBase = 
        `Mascota: ${data.mascotaNombre}\n` +
        `Folio de Receta: ${data.folio_receta}\n` +
        `Válido hasta: ${data.fecha_expiracion}`;

    try {
        await resend.emails.send({
            from: `PawsitiveVibes <${FROM}>`,
            to: data.toCliente,
            subject: subjectCliente,
            html: buildRecetaGeneradaHtmlCliente(data),
            text: `Se ha generado una nueva receta para tu mascota.\n\n${textBase}`
        });
        console.log('Correo de receta generado y enviado a:', data.toCliente);
    } catch (err) {
        console.error('Error enviando correo de receta generada:', err?.response?.data || err?.message || err);
    }
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

async function sendPasswordResetEmail(to, resetLink) {
  if (provider !== 'resend') {
    throw new Error(`EMAIL_PROVIDER no soportado: ${provider}`);
  }
  if (!to) throw new Error('sendPasswordResetEmail: falta "to"');
  if (!resetLink) throw new Error('sendPasswordResetEmail: falta "resetLink"');

  const subject = 'Recuperación de contraseña - PawsitiveVibes';

  try {
    const res = await resend.emails.send({
      from: `PawsitiveVibes <${FROM}>`,
      to,
      subject,
      html: buildPasswordResetHtml(resetLink),
      text: `
Has solicitado restablecer tu contraseña en PawsitiveVibes.

Abre este enlace en tu navegador para establecer una nueva contraseña:
${resetLink}

Si no fuiste tú, puedes ignorar este mensaje.
      `.trim()
    });

    return res;
  } catch (error) {
    const details = error?.response?.data || error?.message || error;
    console.error('Error enviando correo de recuperación:', details);
    throw new Error('No se pudo enviar el correo de recuperación de contraseña');
  }
}

function buildCitaAgendadaHtmlCliente(d) {
  return `
  <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;background:#f9faf9;padding:24px;border-radius:14px;max-width:600px;margin:auto;border:1px solid #e8e8e8">
    <div style="text-align:center;margin-bottom:16px">
      <img src="https://res.cloudinary.com/dzxi5k6ez/image/upload/v1760911319/PAWSITIVE_VIBES_2_nt3js7.png" alt="PawsitiveVibes" style="width:80px;height:80px;border-radius:50%;object-fit:contain"/>
    </div>
    <h2 style="margin:0 0 8px;color:#1B5E20;text-align:center"> ¡Tu cita está confirmada!</h2>
    <p style="margin:0 0 18px;text-align:center;color:#444">Gracias por confiar en <b>PawsitiveVibes</b>. Estos son los detalles:</p>
    <div style="background:#ffffff;border:1px solid #eee;border-radius:12px;padding:16px">
      <p style="margin:6px 0"><b>Cliente:</b> ${d.clienteNombre}</p>
      <p style="margin:6px 0"><b>Mascota:</b> ${d.mascotaNombre}</p>
      <p style="margin:6px 0"><b>Fecha:</b> ${d.fecha}</p>
      <p style="margin:6px 0"><b>Hora:</b> ${d.hora}</p>
      <p style="margin:6px 0"><b>Veterinario:</b> ${d.veterinarioNombre}</p>
      <p style="margin:6px 0"><b>Motivo:</b> ${d.motivo || '-'}</p>
    </div>
    <p style="color:#666;font-size:13px;margin:14px 0 0">Tip: llega 10 min antes y trae tu cartilla de vacunación.</p>
    <div style="height:6px;background:#FFBFA3;border-radius:12px;margin-top:16px"></div>
  </div>`;
}

function buildCitaAgendadaHtmlVeterinario(d) {
  return `
  <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;background:#fff7ed;padding:20px;border-radius:12px;max-width:640px;margin:auto;border:1px solid #ffd7b8">
    <h2 style="margin:0 0 12px;color:#8B4A00"> Nueva cita asignada</h2>
    <p style="margin:0 0 12px;color:#5a4636">Se ha programado una consulta. Resumen operativo:</p>
    <table style="border-collapse:collapse;width:100%;background:#fff">
      <tr><td style="padding:8px;border:1px solid #f0e0cf;width:32%">Paciente</td><td style="padding:8px;border:1px solid #f0e0cf"><b>${d.mascotaNombre}</b></td></tr>
      <tr><td style="padding:8px;border:1px solid #f0e0cf">Fecha</td><td style="padding:8px;border:1px solid #f0e0cf">${d.fecha}</td></tr>
      <tr><td style="padding:8px;border:1px solid #f0e0cf">Hora</td><td style="padding:8px;border:1px solid #f0e0cf">${d.hora}</td></tr>
      <tr><td style="padding:8px;border:1px solid #f0e0cf">Tutor</td><td style="padding:8px;border:1px solid #f0e0cf">${d.clienteNombre}</td></tr>
      <tr><td style="padding:8px;border:1px solid #f0e0cf">Motivo</td><td style="padding:8px;border:1px solid #f0e0cf">${d.motivo || '-'}</td></tr>
    </table>
    <p style="margin:12px 0 0;color:#5a4636;font-size:13px">Nota: verifique antecedentes clínicos en el expediente de la mascota.</p>
  </div>`;
}

function buildCitaCanceladaHtmlCliente(d) {
  return `
  <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;background:#fff2f2;padding:24px;border-radius:12px;max-width:600px;margin:auto;border:1px solid #f0caca">
    <h2 style="margin:0 0 10px;color:#B00020;text-align:center"> Cita cancelada</h2>
    <p style="margin:0 16px 16px;text-align:center;color:#555">Tu cita ha sido cancelada. Si fue un error, puedes reagendar.</p>
    <div style="background:#ffffff;border:1px solid #f1d0d0;border-radius:12px;padding:16px">
      <p style="margin:6px 0"><b>Mascota:</b> ${d.mascotaNombre}</p>
      <p style="margin:6px 0"><b>Fecha:</b> ${d.fecha}</p>
      <p style="margin:6px 0"><b>Hora:</b> ${d.hora}</p>
      <p style="margin:6px 0"><b>Veterinario:</b> ${d.veterinarioNombre}</p>
      <p style="margin:6px 0"><b>Motivo (original):</b> ${d.motivo || '-'}</p>
    </div>
    <p style="color:#777;font-size:12px;margin-top:12px">¿Necesitas ayuda? Responde a este correo.</p>
  </div>`;
}

function buildCitaCanceladaHtmlVeterinario(d) {
  return `
  <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;background:#fff7f7;padding:18px;border-radius:12px;max-width:640px;margin:auto;border:1px solid #f3d4d4">
    <h2 style="margin:0 0 10px;color:#7A1C1C"> Cancelación de cita</h2>
    <p style="margin:0 0 10px;color:#5a3b3b">Se canceló la cita programada. Detalles:</p>
    <ul style="margin:0 0 0 18px;padding:0;color:#4b2f2f">
      <li><b>Paciente:</b> ${d.mascotaNombre}</li>
      <li><b>Fecha:</b> ${d.fecha}</li>
      <li><b>Hora:</b> ${d.hora}</li>
      <li><b>Tutor:</b> ${d.clienteNombre}</li>
      <li><b>Motivo (original):</b> ${d.motivo || '-'}</li>
    </ul>
    <p style="margin:12px 0 0;color:#5a3b3b;font-size:13px">Considere liberar el slot en su agenda.</p>
  </div>`;
}

/**
 * Envía correos por cita agendada con plantillas por rol.
 * @param {{data:{
 *  toCliente?:string,toVeterinario?:string,
 *  clienteNombre:string,veterinarioNombre:string,mascotaNombre:string,
 *  fecha:string,hora:string,motivo?:string
 * }}} params
 */
async function enviarCorreoCitaAgendada({ data }) {
  const subjectCliente = `Tu cita está confirmada • ${data.mascotaNombre} • ${data.fecha} ${data.hora}`;
  const subjectVeterinario = `Nueva cita asignada • ${data.mascotaNombre} • ${data.fecha} ${data.hora}`;

  const textBase =
    `Mascota: ${data.mascotaNombre}
Fecha: ${data.fecha}
Hora: ${data.hora}
Veterinario: ${data.veterinarioNombre}
Tutor: ${data.clienteNombre}
Motivo: ${data.motivo || '-'}`;

  const sends = [];
  if (data.toCliente) {
    sends.push(resend.emails.send({
      from: `PawsitiveVibes <${FROM}>`,
      to: data.toCliente,
      subject: subjectCliente,
      html: buildCitaAgendadaHtmlCliente(data),
      text: `Tu cita está confirmada\n${textBase}`
    }));
  }
  if (data.toVeterinario) {
    sends.push(resend.emails.send({
      from: `PawsitiveVibes <${FROM}>`,
      to: data.toVeterinario,
      subject: subjectVeterinario,
      html: buildCitaAgendadaHtmlVeterinario(data),
      text: `Nueva cita asignada\n${textBase}`
    }));
  }

  try { await Promise.all(sends); }
  catch (err) {
    console.error('Error enviando correos (agendada):', err?.response?.data || err?.message || err);
  }
}

/**
 * Envía correos por cita cancelada con plantillas por rol.
 * @param {{data:{
 *  toCliente?:string,toVeterinario?:string,
 *  clienteNombre:string,veterinarioNombre:string,mascotaNombre:string,
 *  fecha:string,hora:string,motivo?:string
 * }}} params
 */
async function enviarCorreoCitaCancelada({ data }) {
  const subjectCliente = `Cita cancelada • ${data.mascotaNombre} • ${data.fecha} ${data.hora}`;
  const subjectVeterinario = `Cancelación de cita • ${data.mascotaNombre} • ${data.fecha} ${data.hora}`;

  const textBase =
    `Mascota: ${data.mascotaNombre}
Fecha: ${data.fecha}
Hora: ${data.hora}
Veterinario: ${data.veterinarioNombre}
Tutor: ${data.clienteNombre}
Motivo (original): ${data.motivo || '-'}`;

  const sends = [];
  if (data.toCliente) {
    sends.push(resend.emails.send({
      from: `PawsitiveVibes <${FROM}>`,
      to: data.toCliente,
      subject: subjectCliente,
      html: buildCitaCanceladaHtmlCliente(data),
      text: `Cita cancelada\n${textBase}`
    }));
  }
  if (data.toVeterinario) {
    sends.push(resend.emails.send({
      from: `PawsitiveVibes <${FROM}>`,
      to: data.toVeterinario,
      subject: subjectVeterinario,
      html: buildCitaCanceladaHtmlVeterinario(data),
      text: `Cancelación de cita\n${textBase}`
    }));
  }

  try { await Promise.all(sends); }
  catch (err) {
    console.error('Error enviando correos (cancelada):', err?.response?.data || err?.message || err);
  }
}

module.exports = {
  enviarCorreoVerificacion,
  enviarCorreoCitaAgendada,
  enviarCorreoCitaCancelada,
  sendPasswordResetEmail,
  enviarCorreoRecetaGenerada
};