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
