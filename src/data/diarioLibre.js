const STORAGE_KEY = "mama-dashboard:diario-libre";

export const prompts = [
  "¿Qué fue lo más lindo que sentiste hoy?",
  "¿Qué te dio miedo hoy, y por qué crees que fue así?",
  "¿Qué le dirías a tu bebé en este momento de tu vida?",
  "¿Qué necesitás escuchar hoy que nadie te dijo?",
  "¿Cómo te imaginás el día que lo/la conozcas?",
  "¿Qué cambió en vos desde que empezaste este viaje?",
  "¿Qué es algo que te está costando pedir ayuda con?",
  "¿Qué momento de hoy te gustaría recordar siempre?",
  "Si pudieras hablar con tu yo de hace un año, ¿qué le dirías?",
  "¿Qué parte de tu cuerpo querés agradecer hoy?",
];

export function loadEntradas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveEntradas(entradas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
}

export function nuevoPromptAleatorio(actual) {
  const opciones = prompts.filter((p) => p !== actual);
  return opciones[Math.floor(Math.random() * opciones.length)];
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const weekdayLabelsLargo = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

export function getWeekDates(refDate) {
  const day = refDate.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatRangoSemana(dias) {
  const opciones = { day: "numeric", month: "short" };
  const inicio = dias[0].toLocaleDateString("es-AR", opciones);
  const fin = dias[6].toLocaleDateString("es-AR", opciones);
  return `${inicio} – ${fin}`;
}
