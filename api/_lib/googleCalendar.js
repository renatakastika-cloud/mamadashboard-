import { createHmac, timingSafeEqual } from "node:crypto";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const STATE_TTL_MS = 10 * 60 * 1000;

export function getRedirectUri(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}/api/google-calendar/callback`;
}

export async function getUserFromRequest(req, supabaseAdmin) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;
  return data.user;
}

function sign(payload) {
  return createHmac("sha256", process.env.OAUTH_STATE_SECRET).update(payload).digest("hex");
}

export function signState(userId) {
  const expiresAt = Date.now() + STATE_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyState(state) {
  const parts = (state || "").split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresAt, signature] = parts;
  const expected = sign(`${userId}.${expiresAt}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() > Number(expiresAt)) return null;
  return userId;
}

export function buildGoogleAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code, redirectUri) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`);
  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`);
  return res.json();
}

export async function getValidAccessToken(userId, supabaseAdmin) {
  const { data: record } = await supabaseAdmin
    .from("google_calendar_tokens")
    .select("refresh_token, access_token, access_token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!record) return null;

  const expiresAt = new Date(record.access_token_expires_at).getTime();
  if (record.access_token && expiresAt > Date.now() + 60_000) {
    return record.access_token;
  }

  const refreshed = await refreshAccessToken(record.refresh_token);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await supabaseAdmin
    .from("google_calendar_tokens")
    .update({ access_token: refreshed.access_token, access_token_expires_at: newExpiresAt })
    .eq("user_id", userId);

  return refreshed.access_token;
}
