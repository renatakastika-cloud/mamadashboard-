import { Resend } from "resend";

export const CODE_TTL_MINUTES = 10;

export async function sendOtpEmail(to, code) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurada");
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "Mamá App <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Tu código de verificación",
    html: `<p>Hola,</p><p>Tu código de verificación es:</p><p style="font-size:24px;font-weight:bold;">${code}</p><p>Válido por ${CODE_TTL_MINUTES} minutos.</p>`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
