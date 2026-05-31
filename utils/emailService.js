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
    // 1. Generamos el HTML de la lista de productos dinámicamente
    let productosHtml = '';
    
    if (d.listaProductos && d.listaProductos.length > 0) {
        // Mapeamos cada producto a un elemento de lista <li>
        const items = d.listaProductos.map(p => `
            <li style="margin-bottom:10px; color:#444;">
                <strong style="color:#1565C0;">${p.nombre}</strong>
                <div style="font-size:13px; color:#666;">
                    Dosis: ${p.dosis} <span style="color:#aaa;">|</span> Cantidad: ${p.cantidad}
                </div>
            </li>
        `).join('');
        
        productosHtml = `<ul style="padding-left:20px; margin:0;">${items}</ul>`;
    } else {
        productosHtml = '<p style="color:#888; font-style:italic; font-size:14px;">No se registraron medicamentos para compra.</p>';
    }

    // 2. Retornamos la plantilla completa
    return `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                background-color:#e3f2fd; 
                padding:32px;
                border-radius:12px;
                max-width:550px;
                margin:auto;
                border:1px solid #bbdefb;
                box-shadow:0 4px 12px rgba(0,0,0,0.08);">

        <div style="text-align:center;margin-bottom:24px;">
            <img src="https://res.cloudinary.com/dzxi5k6ez/image/upload/v1760911319/PAWSITIVE_VIBES_2_nt3js7.png" 
                 alt="PawsitiveVibes Logo"
                 style="width:80px;height:80px;object-fit:contain;border-radius:50%;"/>
        </div>

        <h2 style="color:#1565C0;text-align:center;margin:0 0 8px;font-size:24px;">
            📄 Resumen de Consulta
        </h2>

        <p style="color:#444;text-align:center;margin:16px 0 24px;font-size:16px;">
            Hola <b>${d.clienteNombre}</b>. Aquí tienes el resumen de la atención brindada a <b>${d.mascotaNombre}</b>.
        </p>
        
        <div style="background:#ffffff; border:1px solid #b3e5fc; border-radius:12px; padding:20px; text-align:center; margin-bottom:24px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
            <p style="margin:0 0 8px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">
                Folio para Farmacia
            </p>
            <span style="display:block;
                         background-color:#E1F5FE;
                         color:#0277BD;
                         font-weight:bold;
                         font-size:28px;
                         letter-spacing:4px;
                         padding:12px;
                         border-radius:8px;
                         margin-bottom:8px;">
                ${d.folio_receta}
            </span>
            <p style="margin:0;font-size:12px;color:#888;">
                Vence el: ${d.fecha_expiracion}
            </p>
        </div>

        <div style="background:#ffffff; border-radius:12px; padding:24px; margin-bottom:24px;">
            <h3 style="color:#1565C0; margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; font-size:18px;">
                📋 Detalles Médicos
            </h3>
            
            <div style="margin-bottom:16px;">
                <strong style="color:#333; font-size:14px;">Diagnóstico:</strong>
                <p style="margin:4px 0 0; color:#555; font-size:15px; line-height:1.4;">${d.diagnostico}</p>
            </div>

            <div style="margin-bottom:16px;">
                <strong style="color:#333; font-size:14px;">Tratamiento / Indicaciones:</strong>
                <p style="margin:4px 0 0; color:#555; font-size:15px; line-height:1.4; white-space:pre-wrap;">${d.tratamiento}</p>
            </div>

            <div style="margin-bottom:16px;">
                <strong style="color:#333; font-size:14px;">Observaciones:</strong>
                <p style="margin:4px 0 0; color:#555; font-size:14px; line-height:1.4;">${d.observaciones}</p>
            </div>

            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed #ddd;">
                <strong style="color:#333; font-size:14px;">💊 Medicamentos Recetados:</strong>
                <div style="margin-top:10px; font-size:14px;">
                    ${productosHtml}
                </div>
            </div>
        </div>

        <p style="color:#666;font-size:14px;text-align:center;margin:0;">
            Puedes presentar el folio en recepción o usarlo en nuestra tienda en línea.
        </p>

        <hr style="border:none;border-top:1px solid #cfd8dc;margin:24px 0;">

        <p style="text-align:center;color:#90a4ae;font-size:12px;">
            <strong style="color:#64B5F6;">PawsitiveVibes 🐾</strong><br>
            Cuidando a quienes más amas.<br>
            <span style="color:#b0bec5;">${FROM}</span>
        </p>
    </div>
    `;
}

async function enviarCorreoRecetaGenerada({ data }) {
    if (provider !== 'resend') {
        console.warn(`EMAIL_PROVIDER no es 'resend', omitiendo envío.`);
        return;
    }
    if (!data.toCliente || !data.folio_receta) {
        console.error('enviarCorreoRecetaGenerada: Faltan datos críticos.');
        return;
    }

    const subjectCliente = `Resumen de Consulta y Receta • ${data.mascotaNombre}`;
    
    // Generamos también una versión en texto plano por si el HTML falla
    let productosTexto = '';
    if (data.listaProductos && data.listaProductos.length > 0) {
        productosTexto = data.listaProductos.map(p => `- ${p.nombre}: ${p.dosis}`).join('\n');
    } else {
        productosTexto = 'Sin medicamentos registrados.';
    }

    const textBase = 
        `Hola, aquí el resumen para ${data.mascotaNombre}.\n\n` +
        `FOLIO RECETA: ${data.folio_receta}\n` +
        `Vence: ${data.fecha_expiracion}\n\n` +
        `DIAGNÓSTICO: ${data.diagnostico}\n` +
        `TRATAMIENTO: ${data.tratamiento}\n\n` +
        `MEDICAMENTOS:\n${productosTexto}`;

    try {
        await resend.emails.send({
            from: `PawsitiveVibes <${FROM}>`,
            to: data.toCliente,
            subject: subjectCliente,
            html: buildRecetaGeneradaHtmlCliente(data),
            text: textBase
        });
        console.log('Correo de consulta completa enviado a:', data.toCliente);
    } catch (err) {
        console.error('Error enviando correo:', err?.response?.data || err?.message || err);
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

// ... (Código anterior)

// Nueva función para la plantilla de confirmación de compra
function buildCorreoConfirmacionCompraHtml(d) {
    // 1. Generamos el HTML de la lista de productos comprados
    let productosHtml = '';
    
    if (d.detalles && d.detalles.length > 0) {
        const items = d.detalles.map(item => {
            // Asumiendo que item.producto.nombre o item.nombre viene cargado, 
            // pero si solo pasas el detalle de la CompraDetalle, usamos los datos disponibles
            const nombreProducto = item.producto?.nombre || `Producto ID ${item.id_producto}`;
            const subtotal = (item.cantidad * parseFloat(item.precio_unitario)).toFixed(2);
            return `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px 0;font-size:14px;color:#333;">${nombreProducto}</td>
                    <td style="padding:10px 0;font-size:14px;color:#555;text-align:center;">${item.cantidad}</td>
                    <td style="padding:10px 0;font-size:14px;color:#555;text-align:right;">$${item.precio_unitario}</td>
                    <td style="padding:10px 0;font-size:14px;color:#333;font-weight:bold;text-align:right;">$${subtotal}</td>
                </tr>
            `;
        }).join('');
        
        productosHtml = `
            <table style="width:100%;border-collapse:collapse;margin-top:10px;">
                <thead>
                    <tr style="background-color:#f8f8f8;">
                        <th style="padding:10px 0;text-align:left;color:#555;font-size:13px;">Producto</th>
                        <th style="padding:10px 0;text-align:center;color:#555;font-size:13px;">Cant.</th>
                        <th style="padding:10px 0;text-align:right;color:#555;font-size:13px;">Precio Unit.</th>
                        <th style="padding:10px 0;text-align:right;color:#555;font-size:13px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>${items}</tbody>
            </table>
        `;
    } else {
        productosHtml = '<p style="color:#888; font-style:italic; font-size:14px; text-align:center;">No se registraron productos en esta compra.</p>';
    }

    return `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                background-color:#e8f5e9; /* Tono verde claro */
                padding:32px;
                border-radius:12px;
                max-width:600px;
                margin:auto;
                border:1px solid #c8e6c9;
                box-shadow:0 4px 12px rgba(0,0,0,0.08);">

        <div style="text-align:center;margin-bottom:24px;">
            <img src="https://res.cloudinary.com/dzxi5k6ez/image/upload/v1760911319/PAWSITIVE_VIBES_2_nt3js7.png" 
                 alt="PawsitiveVibes Logo"
                 style="width:80px;height:80px;object-fit:contain;border-radius:50%;"/>
        </div>

        <h2 style="color:#2E7D32;text-align:center;margin:0 0 8px;font-size:24px;">
            🛒 Confirmación de Pedido
        </h2>

        <p style="color:#444;text-align:center;margin:16px 0 24px;font-size:16px;">
            Hola <b>${d.clienteNombre}</b>. Tu compra ha sido registrada con éxito.
        </p>
        
        <div style="background:#ffffff; border:1px solid #a5d6a7; border-radius:12px; padding:20px; margin-bottom:24px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
            <p style="margin:0 0 8px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:1px;font-weight:bold;text-align:center;">
                Folio de Movimiento (Para Descuento de Inventario)
            </p>
            <span style="display:block;
                          background-color:#C8E6C9;
                          color:#1B5E20;
                          font-weight:bold;
                          font-size:28px;
                          letter-spacing:4px;
                          padding:12px;
                          border-radius:8px;
                          text-align:center;
                          margin-bottom:12px;">
                ${d.folio}
            </span>
            <p style="margin:0;font-size:12px;color:#888;text-align:center;">
                Este folio es la referencia de tu movimiento y debe ser usado para descontar el stock.
            </p>
        </div>
        
        <div style="background:#ffffff; border-radius:12px; padding:24px; margin-bottom:24px;">
            <h3 style="color:#2E7D32; margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; font-size:18px;">
                Detalles de tu Compra
            </h3>
            
            ${productosHtml}

            <div style="border-top:2px solid #ddd; margin-top:15px; padding-top:10px;">
                <p style="margin:4px 0;font-size:18px;text-align:right;color:#1B5E20;">
                    <b>Total: $${parseFloat(d.total).toFixed(2)}</b>
                </p>
                <p style="margin:4px 0;font-size:14px;text-align:right;color:#555;">
                    Estado de Pago: <b>Pendiente</b>
                </p>
            </div>
        </div>

        <p style="color:#666;font-size:14px;text-align:center;margin:0;">
            Tu pedido será procesado una vez que se confirme el pago.
        </p>

        <hr style="border:none;border-top:1px solid #d4e7d4;margin:24px 0;">

        <p style="text-align:center;color:#90a4ae;font-size:12px;">
            <strong style="color:#4CAF50;">PawsitiveVibes 🐾</strong><br>
            Cuidando a quienes más amas.<br>
            <span style="color:#b0bec5;">${FROM}</span>
        </p>
    </div>
    `;
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

async function enviarCorreoConfirmacionCompra({ data }) {
    if (provider !== 'resend') {
        console.warn(`EMAIL_PROVIDER no es 'resend', omitiendo envío.`);
        return;
    }
    if (!data.toCliente || !data.folio) {
        console.error('enviarCorreoConfirmacionCompra: Faltan datos críticos (toCliente o folio).');
        return;
    }

    const subjectCliente = `Confirmación de Pedido (Folio: ${data.folio})`;
    
    // Generamos también una versión en texto plano
    let productosTexto = '';
    if (data.detalles && data.detalles.length > 0) {
        productosTexto = data.detalles.map(item => {
            const nombre = item.producto?.nombre || `Producto ID ${item.id_producto}`;
            return `- ${nombre} x${item.cantidad} ($${item.precio_unitario} c/u)`;
        }).join('\n');
    } else {
        productosTexto = 'Sin productos registrados.';
    }

    const textBase = 
        `Hola ${data.clienteNombre},\n\n` +
        `Tu pedido ha sido registrado.\n` +
        `FOLIO DE MOVIMIENTO: ${data.folio}\n\n` +
        `PRODUCTOS:\n${productosTexto}\n\n` +
        `TOTAL: $${parseFloat(data.total).toFixed(2)}\n\n` +
        `El pago está pendiente de confirmación.`;

    try {
        await resend.emails.send({
            from: `PawsitiveVibes <${FROM}>`,
            to: data.toCliente,
            subject: subjectCliente,
            html: buildCorreoConfirmacionCompraHtml(data),
            text: textBase
        });
        console.log('Correo de confirmación de compra enviado a:', data.toCliente);
    } catch (err) {
        console.error('Error enviando correo de confirmación de compra:', err?.response?.data || err?.message || err);
    }
}

module.exports = {
  enviarCorreoVerificacion,
  enviarCorreoCitaAgendada,
  enviarCorreoCitaCancelada,
  sendPasswordResetEmail,
  enviarCorreoRecetaGenerada,
  enviarCorreoConfirmacionCompra
};