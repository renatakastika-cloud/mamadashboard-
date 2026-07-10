const STORAGE_KEY = "mama-dashboard:bebe";

export const emptyBebe = {
  registrado: false,
  nombre: "",
  fechaNacimiento: "",
  peso: "",
  proximoControl: "",
};

export function loadBebe() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyBebe, ...saved } : { ...emptyBebe };
  } catch {
    return { ...emptyBebe };
  }
}

export function saveBebe(bebe) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bebe));
}

export function diasConBebe(fechaNacimiento) {
  if (!fechaNacimiento) return 0;
  const nacimiento = new Date(fechaNacimiento + "T00:00:00");
  const hoy = new Date();
  const diffMs = hoy.setHours(0, 0, 0, 0) - nacimiento.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}
