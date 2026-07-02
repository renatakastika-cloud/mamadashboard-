const STORAGE_KEY = "mama-dashboard:plan-parto";

export const emptyPlan = {
  nombre: "",
  fpp: "",
  medico: "",
  hospital: "",
  acompanantes: "",
  tipoPartoDeseado: "natural",
  manejoDolor: "",
  ambiente: "",
  posiciones: "",
  episiotomia: "",
  monitoreoFetal: "",
  contactoPielAPiel: true,
  cordonRetrasado: true,
  lactanciaInmediata: true,
  siCesarea: "",
  personaCorteCordon: "",
  notasEquipoMedico: "",
  archivos: [],
};

export function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyPlan, ...saved } : { ...emptyPlan };
  } catch {
    return { ...emptyPlan };
  }
}

export function savePlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}
