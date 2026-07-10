const STORAGE_KEY = "mama-dashboard:contactos-medicos";

export function loadContactos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveContactos(contactos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contactos));
}

export const rolesSugeridos = [
  "Obstetra",
  "Partera / matrona",
  "Pediatra",
  "Anestesista",
  "Hospital / maternidad",
  "Acompañante",
  "Otro",
];
