import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";
import { getUserFromRequest, getRedirectUri, signState, buildGoogleAuthUrl } from "../_lib/googleCalendar.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) {
    res.status(401).json({ error: "No autenticado." });
    return;
  }

  const redirectUri = getRedirectUri(req);
  const state = signState(user.id);
  const url = buildGoogleAuthUrl({ redirectUri, state });

  res.status(200).json({ url });
}
