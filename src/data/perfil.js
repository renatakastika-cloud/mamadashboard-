const STORAGE_KEY = "mama-dashboard:perfil";

export const emptyPerfil = {
  semanaActual: 24,
  fpp: "",
  medico: "",
  hospital: "",
};

export function loadPerfil() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyPerfil, ...saved } : { ...emptyPerfil };
  } catch {
    return { ...emptyPerfil };
  }
}

export function savePerfil(perfil) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
}
