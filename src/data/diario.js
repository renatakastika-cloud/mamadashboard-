import { loadRegistros } from "./registroDiario";

const STORAGE_KEY = "mama-dashboard:diario";

export function loadEntradas() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (guardadas) return guardadas;
  } catch {
    // noop, seguimos a la migración
  }

  // Primera vez: si ya había notas escritas en el check-in de Inicio, las
  // traemos al diario para no perder lo que la usuaria ya escribió.
  const registros = loadRegistros();
  const migradas = {};
  Object.values(registros).forEach((r) => {
    if (r.nota?.trim()) {
      migradas[r.fecha] = {
        fecha: r.fecha,
        texto: r.nota,
        prompt: r.prompt || null,
        archivos: r.archivos || [],
        destacado: false,
      };
    }
  });
  saveEntradas(migradas);
  return migradas;
}

export function saveEntradas(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadEntradaDelDia(fecha) {
  return loadEntradas()[fecha] || null;
}

export function guardarEntradaDelDia(fecha, entrada) {
  const all = loadEntradas();
  all[fecha] = { destacado: false, ...all[fecha], ...entrada, fecha };
  saveEntradas(all);
  return all[fecha];
}

export function toggleDestacado(fecha) {
  const all = loadEntradas();
  if (!all[fecha]) return all;
  all[fecha] = { ...all[fecha], destacado: !all[fecha].destacado };
  saveEntradas(all);
  return all;
}

export function eliminarEntrada(fecha) {
  const all = loadEntradas();
  delete all[fecha];
  saveEntradas(all);
  return all;
}
