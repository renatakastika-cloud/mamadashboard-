export const catalogoSintomas = [
  { label: "Náuseas matutinas", icon: "🤢" },
  { label: "Fatiga intensa", icon: "😴" },
  { label: "Sensibilidad en los pechos", icon: "💗" },
  { label: "Cambios de humor", icon: "🎭" },
  { label: "Aumento de la micción", icon: "🚻" },
  { label: "Aversión a ciertos olores", icon: "👃" },
  { label: "Antojos", icon: "🍫" },
  { label: "Mareos leves", icon: "💫" },
  { label: "Hinchazón abdominal", icon: "🎈" },
  { label: "Más energía", icon: "⚡" },
  { label: "Aparece la línea morena", icon: "〰️" },
  { label: "Dolor en el ligamento redondo", icon: "🤕" },
  { label: "Congestión nasal", icon: "🤧" },
  { label: "Encías sensibles", icon: "🦷" },
  { label: "Primeros movimientos del bebé", icon: "👶" },
  { label: "Aumento del apetito", icon: "🍽️" },
  { label: "Calambres en las piernas", icon: "🦵" },
  { label: "Piel más luminosa", icon: "✨" },
  { label: "Dolor de espalda", icon: "🦴" },
  { label: "Hinchazón en pies y manos", icon: "🦶" },
  { label: "Falta de aire", icon: "😮‍💨" },
  { label: "Contracciones de Braxton-Hicks", icon: "💥" },
  { label: "Insomnio", icon: "🌙" },
  { label: "Acidez estomacal", icon: "🔥" },
  { label: "Mayor frecuencia urinaria", icon: "🚽" },
  { label: "Pesadez pélvica", icon: "🏋️" },
  { label: "Dificultad para dormir cómoda", icon: "🛏️" },
  { label: "Dolor de cabeza", icon: "🤯" },
  { label: "Estreñimiento", icon: "🚿" },
  { label: "Venas varicosas", icon: "🦵" },

  // Señales para comentar con el médico (no son un diagnóstico, solo una sugerencia)
  { label: "Sangrado vaginal", icon: "🩸", atencion: true },
  { label: "Fiebre", icon: "🌡️", atencion: true },
  { label: "Dolor de cabeza fuerte o que no pasa", icon: "🤕", atencion: true },
  { label: "Hinchazón repentina en cara o manos", icon: "😳", atencion: true },
  { label: "Disminución de los movimientos del bebé", icon: "👶", atencion: true },
  { label: "Pérdida de líquido", icon: "💧", atencion: true },
  { label: "Dolor abdominal intenso", icon: "😣", atencion: true },
  { label: "Visión borrosa", icon: "👁️", atencion: true },
];

const ICONO_DEFECTO = "📝";

export function iconoSintoma(label) {
  return catalogoSintomas.find((s) => s.label === label)?.icon || ICONO_DEFECTO;
}

export function esSintomaDeAtencion(label) {
  return catalogoSintomas.some((s) => s.label === label && s.atencion);
}
