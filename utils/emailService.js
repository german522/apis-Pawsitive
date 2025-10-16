import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarCorreoVerificacion = async (email, codigo) => {
  try {
    await resend.emails.send({
      from: "Tu Proyecto <onboarding@resend.dev>", // Puedes usar este remitente de prueba
      to: email,
      subject: "Verificación de correo electrónico",
      html: `
        <h2>Verificación de correo</h2>
        <p>Tu código de verificación es:</p>
        <h1>${codigo}</h1>
        <p>Expira en 10 minutos.</p>
      `,
    });
    console.log(`Correo enviado a ${email}`);
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw new Error("No se pudo enviar el correo de verificación.");
  }
};
