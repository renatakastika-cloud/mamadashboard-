import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";
import { getRedirectUri, verifyState, exchangeCodeForTokens } from "../_lib/googleCalendar.js";

export default async function handler(req, res) {
  const { code, state, error: googleError } = req.query;

  if (googleError) {
    res.writeHead(302, { Location: "/?google_calendar=error" });
    res.end();
    return;
  }

  const userId = verifyState(state);
  if (!userId || !code) {
    res.writeHead(302, { Location: "/?google_calendar=error" });
    res.end();
    return;
  }

  try {
    const redirectUri = getRedirectUri(req);
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.refresh_token) {
      res.writeHead(302, { Location: "/?google_calendar=error" });
      res.end();
      return;
    }

    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from("google_calendar_tokens").upsert({
      user_id: userId,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    res.writeHead(302, { Location: "/?google_calendar=connected" });
    res.end();
  } catch {
    res.writeHead(302, { Location: "/?google_calendar=error" });
    res.end();
  }
}
