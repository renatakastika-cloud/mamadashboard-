const STORAGE_KEY = "mama-dashboard:registro-postparto";

export const totalSemanasPostparto = 12;

const hitos = [
  "El útero comienza a contraerse de vuelta a su tamaño. Es normal el loquio (sangrado postparto).",
  "El cansancio es intenso. Priorizá descansar cuando el bebé descansa.",
  "Las hormonas siguen en movimiento: cambios de ánimo son esperables.",
  "La cicatriz (vaginal o de cesárea) empieza a sanar visiblemente.",
  "Suele ser el momento de la primera consulta postparto con tu obstetra.",
  "El sangrado debería ser cada vez más claro y escaso.",
  "Podés empezar a sentir más energía, aunque varía mucho de persona a persona.",
  "Es un buen momento para evaluar el suelo pélvico con un profesional.",
  "Si tuviste cesárea, la cicatriz externa suele estar bastante cerrada.",
  "El cuerpo sigue recuperándose; no hay prisa ni comparación válida con otras mamás.",
  "Muchas personas reciben el alta médica completa alrededor de esta semana.",
  "Cierre del cuarto trimestre: cada cuerpo tiene su propio ritmo de ahora en más.",
];

const sintomasEsperados = [
  ["Loquio (sangrado)", "Cansancio extremo", "Dolor en la zona perineal o cicatriz"],
  ["Cambios de humor", "Dolor en los pechos (lactancia)", "Calambres uterinos (entuertos)"],
  ["Sudoración nocturna", "Estreñimiento", "Sensibilidad emocional"],
];

export function getSemanaPostpartoData(semana) {
  const idx = semana - 1;
  return {
    semana,
    hito: hitos[idx] || hitos[hitos.length - 1],
    sintomas: sintomasEsperados[idx % sintomasEsperados.length],
  };
}

export function loadRegistroPostparto() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveRegistroPostparto(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
