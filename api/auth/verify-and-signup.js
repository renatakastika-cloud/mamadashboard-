import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const { nombre, email, password, code } = req.body || {};
  if (!nombre?.trim() || !email?.trim() || !password || !code?.trim()) {
    res.status(400).json({ error: "Completá todos los campos." });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();

  const supabaseAdmin = getSupabaseAdmin();

  const { data: record } = await supabaseAdmin
    .from("email_verification_codes")
    .select("code, expires_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  const isExpired = record && new Date(record.expires_at).getTime() < Date.now();
  if (!record || record.code !== code.trim() || isExpired) {
    res.status(400).json({ error: "Código inválido o vencido." });
    return;
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { nombre: nombre.trim() },
  });

  if (createError) {
    res.status(400).json({ error: createError.message });
    return;
  }

  await supabaseAdmin.from("email_verification_codes").delete().eq("email", normalizedEmail);

  res.status(200).json({
    success: true,
    user: { id: created.user.id, nombre: nombre.trim(), email: normalizedEmail },
  });
}
