export const catalogoSintomasPostparto = [
  { label: "Loquio (sangrado)", icon: "🩸" },
  { label: "Cansancio extremo", icon: "😴" },
  { label: "Dolor en la zona perineal o cicatriz", icon: "🤕" },
  { label: "Congestión mamaria", icon: "🍼" },
  { label: "Cambios de humor", icon: "🎭" },
  { label: "Calambres uterinos (entuertos)", icon: "🤰" },
  { label: "Sudoración nocturna", icon: "💦" },
  { label: "Estreñimiento", icon: "🚿" },
  { label: "Dolor de espalda", icon: "🦴" },
  { label: "Dificultad para dormir", icon: "🌙" },
  { label: "Grietas en los pezones", icon: "🤱" },
  { label: "Hinchazón en piernas", icon: "🦶" },

  // Señales para comentar con el médico (no son un diagnóstico, solo una sugerencia)
  { label: "Sangrado abundante (empapa una toalla por hora)", icon: "🩸", atencion: true },
  { label: "Fiebre", icon: "🌡️", atencion: true },
  { label: "Dolor de cabeza fuerte o visión borrosa", icon: "🤕", atencion: true },
  { label: "Enrojecimiento, calor o secreción en la cicatriz", icon: "⚠️", atencion: true },
  { label: "Dolor o hinchazón fuerte en una pierna", icon: "🦵", atencion: true },
  { label: "Pensamientos de hacerte daño o de dañar al bebé", icon: "💜", atencion: true },
];

const ICONO_DEFECTO = "📝";

export function iconoSintomaPostparto(label) {
  return catalogoSintomasPostparto.find((s) => s.label === label)?.icon || ICONO_DEFECTO;
}

export function esSintomaDeAtencionPostparto(label) {
  return catalogoSintomasPostparto.some((s) => s.label === label && s.atencion);
}
