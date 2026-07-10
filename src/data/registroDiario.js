const STORAGE_KEY = "mama-dashboard:registro-diario";

export const animoOpciones = [
  { value: 1, emoji: "😢" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

export const escalaOpciones = [1, 2, 3, 4, 5];

export function loadRegistros() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveRegistros(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadRegistroDelDia(fecha) {
  return loadRegistros()[fecha] || null;
}

export function guardarRegistroDelDia(fecha, registro) {
  const all = loadRegistros();
  all[fecha] = { ...registro, fecha };
  saveRegistros(all);
  return all[fecha];
}
