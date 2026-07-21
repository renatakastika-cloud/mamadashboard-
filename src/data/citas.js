const STORAGE_KEY = "mama-dashboard:citas";

export function loadCitas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCitas(citas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
}

export const tiposCita = [
  "Control obstétrico",
  "Ecografía",
  "Análisis de sangre",
  "Curso de preparto",
  "Odontología",
  "Nutrición",
  "Psicología perinatal",
  "Primera consulta postparto",
  "Otro",
];

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function buildGoogleCalendarUrl(cita) {
  const [year, month, day] = cita.fecha.split("-").map(Number);
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtDate = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  const fmtDateTime = (d) => `${fmtDate(d)}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;

  let dates;
  if (cita.hora) {
    const [h, m] = cita.hora.split(":").map(Number);
    const inicio = new Date(year, month - 1, day, h, m, 0, 0);
    const fin = new Date(inicio.getTime() + 60 * 60 * 1000);
    dates = `${fmtDateTime(inicio)}/${fmtDateTime(fin)}`;
  } else {
    const inicio = new Date(year, month - 1, day);
    const fin = new Date(year, month - 1, day + 1);
    dates = `${fmtDate(inicio)}/${fmtDate(fin)}`;
  }

  const detalles = [
    cita.medico && `Médico/profesional: ${cita.medico}`,
    cita.preguntas && `Preguntas: ${cita.preguntas}`,
    cita.notas && `Notas: ${cita.notas}`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: cita.medico ? `${cita.tipo} con ${cita.medico}` : cita.tipo,
    dates,
  });
  if (detalles) params.set("details", detalles);
  if (cita.lugar) params.set("location", cita.lugar);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const monthLabels = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
