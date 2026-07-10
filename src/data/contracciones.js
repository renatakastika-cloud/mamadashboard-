const STORAGE_KEY = "mama-dashboard:contracciones";

export function loadContracciones() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function guardarContraccion(contraccion) {
  const all = loadContracciones();
  const next = [contraccion, ...all];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function limpiarContracciones() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

export function formatearDuracion(seg) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m > 0 ? `${m} min ` : ""}${s} seg`;
}
