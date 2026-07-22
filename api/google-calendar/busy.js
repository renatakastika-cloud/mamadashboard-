import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";
import { getUserFromRequest, getValidAccessToken } from "../_lib/googleCalendar.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método no permitido." });
    return;
  }

  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Fecha inválida." });
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const user = await getUserFromRequest(req, supabaseAdmin);
  if (!user) {
    res.status(401).json({ error: "No autenticado." });
    return;
  }

  const accessToken = await getValidAccessToken(user.id, supabaseAdmin);
  if (!accessToken) {
    res.status(200).json({ connected: false, events: [] });
    return;
  }

  const timeMin = new Date(`${date}T00:00:00`).toISOString();
  const timeMax = new Date(`${date}T23:59:59`).toISOString();
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
  });

  const eventsRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!eventsRes.ok) {
    res.status(200).json({ connected: true, events: [] });
    return;
  }

  const data = await eventsRes.json();
  const events = (data.items || []).map((ev) => ({
    id: ev.id,
    title: ev.summary || "(Sin título)",
    start: ev.start?.dateTime || ev.start?.date,
    end: ev.end?.dateTime || ev.end?.date,
    allDay: !ev.start?.dateTime,
  }));

  res.status(200).json({ connected: true, events });
}
