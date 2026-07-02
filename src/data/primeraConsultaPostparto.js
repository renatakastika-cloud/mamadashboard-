const STORAGE_KEY = "mama-dashboard:primera-consulta-postparto";

export const preguntasSugeridas = [
  "¿Cómo va la cicatrización (vaginal o de cesárea)?",
  "¿Es normal el sangrado/loquio que estoy teniendo?",
  "¿Cuándo puedo retomar relaciones sexuales?",
  "¿Cuándo puedo retomar el ejercicio físico?",
  "¿Cómo está mi suelo pélvico? ¿Necesito rehabilitación?",
  "¿Qué método anticonceptivo es seguro si estoy lactando?",
  "¿Es esperable sentirme así de cansada o triste?",
  "¿Necesito algún estudio o análisis de control?",
  "¿La lactancia está yendo bien? ¿Hay señales de alarma?",
  "¿Cuándo es el próximo control y qué deberíamos evaluar?",
];

export function loadPrimeraConsulta() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { marcadas: [], propias: [] };
  } catch {
    return { marcadas: [], propias: [] };
  }
}

export function savePrimeraConsulta(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
