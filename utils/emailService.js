const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'okitukisaludmental@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'rvkwtufutfjpqpuq',
    },
    // timeouts para evitar que la conexión bloquee demasiado la transacción
    connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT || '10000', 10),
    greetingTimeout: parseInt(process.env.EMAIL_GREETING_TIMEOUT || '10000', 10),
    socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT || '10000', 10)
});

const enviarCodigoVerificacion = async (correoDestino, codigo, nombreCompleto) => {
    // Si está deshabilitado (por ejemplo en entornos donde SMTP está bloqueado), simular envío
    if (process.env.EMAIL_DISABLED === 'true') {
        console.log(`EMAIL_DISABLED=true - simulando envío de código ${codigo} a ${correoDestino}`);
        return true;
    }
    const mailOptions = {
        from: process.env.EMAIL_USER || 'okitukisaludmental@gmail.com',
        to: correoDestino,
        subject: '🔐 Código de verificación - Pawsitive',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">¡Bienvenido a Pawsitive! 🐾</h2>
                <p>Hola <strong>${nombreCompleto}</strong>,</p>
                <p>Gracias por registrarte en Pawsitive. Para completar tu registro, utiliza el siguiente código de verificación:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h1 style="color: #4CAF50; font-size: 36px; margin: 0; letter-spacing: 5px;">${codigo}</h1>
                </div>
                
                <p><strong>⏰ Este código expirará en 15 minutos.</strong></p>
                
                <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                
                <p style="color: #888; font-size: 12px; text-align: center;">
                    Este es un correo automático, por favor no respondas a este mensaje.<br>
                    © ${new Date().getFullYear()} Pawsitive - Sistema Veterinario
                </p>
            </div>
        `,
        text: `Hola ${nombreCompleto},\n\nTu código de verificación para Pawsitive es: ${codigo}\n\nEste código expirará en 15 minutos.\n\nSi no solicitaste este código, puedes ignorar este mensaje.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Código de verificación enviado a: ${correoDestino}`);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        throw new Error('No se pudo enviar el correo de verificación');
    }
};

module.exports = { enviarCodigoVerificacion };