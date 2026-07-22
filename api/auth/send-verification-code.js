import { randomInt } from "node:crypto";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";
import { sendOtpEmail, CODE_TTL_MINUTES } from "../_lib/resend.js";

const RESEND_COOLDOWN_MINUTES = 2;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const { email } = req.body || {};
  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: "Email inválido." });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();

  const supabaseAdmin = getSupabaseAdmin();

  const { data: existing } = await supabaseAdmin
    .from("email_verification_codes")
    .select("created_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    const secondsSinceLast = (Date.now() - new Date(existing.created_at).getTime()) / 1000;
    const cooldownSeconds = RESEND_COOLDOWN_MINUTES * 60;
    if (secondsSinceLast < cooldownSeconds) {
      const waitSeconds = Math.ceil(cooldownSeconds - secondsSinceLast);
      res.status(429).json({ error: `Esperá ${waitSeconds}s antes de pedir otro código.` });
      return;
    }
  }

  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000).toISOString();

  const { error: upsertError } = await supabaseAdmin
    .from("email_verification_codes")
    .upsert({ email: normalizedEmail, code, expires_at: expiresAt, created_at: now.toISOString() });

  if (upsertError) {
    res.status(500).json({ error: "No se pudo generar el código." });
    return;
  }

  try {
    await sendOtpEmail(normalizedEmail, code);
  } catch (err) {
    console.error("Resend send failed:", err.message);
    res.status(502).json({ error: "No se pudo enviar el email. Intentá de nuevo." });
    return;
  }

  res.status(200).json({ success: true });
}
