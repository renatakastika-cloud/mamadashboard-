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

export function semanaPostpartoDesde(fechaNacimiento) {
  if (!fechaNacimiento) return 1;
  const nacimiento = new Date(fechaNacimiento + "T00:00:00");
  const hoy = new Date();
  const diffMs = hoy.setHours(0, 0, 0, 0) - nacimiento.setHours(0, 0, 0, 0);
  const dias = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const semana = Math.floor(dias / 7) + 1;
  return Math.min(totalSemanasPostparto, Math.max(1, semana));
}

export function getSemanaPostpartoData(semana) {
  const idx = semana - 1;
  return {
    semana,
    hito: hitos[idx] || hitos[hitos.length - 1],
    sintomas: sintomasEsperados[idx % sintomasEsperados.length],
  };
}

export function getGuiaTipoParto(semana, tipoParto) {
  const esCesarea = tipoParto === "cesarea";
  if (semana <= 4) {
    return esCesarea
      ? "La cicatriz de la cesárea todavía está fresca: evitá cargar peso más allá del bebé y mantenela limpia y seca."
      : "La zona perineal puede doler o arder al sentarte; los baños de asiento tibios ayudan a aliviar.";
  }
  if (semana <= 8) {
    return esCesarea
      ? "La cicatriz externa suele estar bastante cerrada, pero la capa interna sigue sanando: seguí evitando esfuerzos bruscos."
      : "El dolor perineal debería ir disminuyendo notablemente; si persiste, comentalo en tu control.";
  }
  return esCesarea
    ? "La cicatriz debería estar consolidada; cualquier molestia persistente vale la pena chequearla."
    : "La zona perineal debería sentirse prácticamente normal a esta altura.";
}

export function getGuiaSueloPelvico(semana) {
  if (semana <= 4) {
    return "Priorizá el descanso; podés empezar con respiración diafragmática suave si te sentís cómoda.";
  }
  if (semana <= 8) {
    return "Es un buen momento para iniciar ejercicios de Kegel suaves, sin forzar.";
  }
  return "Ideal para una evaluación profesional del suelo pélvico si todavía no la hiciste.";
}

export function getGuiaEjercicio(semana, tipoParto) {
  const esCesarea = tipoParto === "cesarea";
  if (semana <= 4) {
    return "Caminatas cortas y suaves está bien; nada de ejercicio intenso todavía.";
  }
  if (semana <= 8) {
    return esCesarea
      ? "Esperá el visto bueno médico antes de retomar ejercicio con impacto o abdominales."
      : "Podés ir sumando caminatas más largas; el resto depende de cómo te sientas y de tu control médico.";
  }
  return "Con el alta médica, muchas personas retoman actividad física gradual entre la semana 8 y 12.";
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
