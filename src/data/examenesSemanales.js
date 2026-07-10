const STORAGE_KEY = "mama-dashboard:registro-examenes";

export const examenesPorTrimestre = [
  {
    trimestre: 1,
    rango: "Semanas 1 a 13",
    examenes: [
      {
        id: "primera-ecografia",
        nombre: "Primera ecografía",
        cuando: "Semana 6 a 9",
        desc: "Confirma el embarazo, la edad gestacional y detecta latidos.",
      },
      {
        id: "analisis-sangre-completo",
        nombre: "Análisis de sangre completo",
        cuando: "Semana 8 a 10",
        desc: "Grupo sanguíneo y factor Rh, hemograma, glucemia, serologías (VIH, sífilis, hepatitis B, toxoplasmosis, rubéola).",
      },
      {
        id: "urocultivo",
        nombre: "Urocultivo",
        cuando: "Semana 8 a 12",
        desc: "Detecta infecciones urinarias, muchas veces sin síntomas.",
      },
      {
        id: "translucencia-nucal",
        nombre: "Ecografía de traslucencia nucal",
        cuando: "Semana 11 a 14",
        desc: "Evalúa riesgo de anomalías cromosómicas junto con análisis de sangre.",
      },
    ],
  },
  {
    trimestre: 2,
    rango: "Semanas 14 a 27",
    examenes: [
      {
        id: "ecografia-morfologica",
        nombre: "Ecografía morfológica",
        cuando: "Semana 18 a 22",
        desc: "Revisión estructural detallada del desarrollo del bebé.",
      },
      {
        id: "curva-glucosa",
        nombre: "Curva de tolerancia a la glucosa",
        cuando: "Semana 24 a 28",
        desc: "Detecta diabetes gestacional.",
      },
      {
        id: "analisis-sangre-control-t2",
        nombre: "Análisis de sangre de control",
        cuando: "Semana 24 a 26",
        desc: "Hemograma de control, principalmente para anemia.",
      },
    ],
  },
  {
    trimestre: 3,
    rango: "Semanas 28 a 40",
    examenes: [
      {
        id: "hisopado-estreptococo-b",
        nombre: "Hisopado vagino-rectal (Estreptococo B)",
        cuando: "Semana 35 a 37",
        desc: "Detecta la bacteria para prevenir contagio al bebé durante el parto.",
      },
      {
        id: "monitoreo-fetal-nst",
        nombre: "Monitoreo fetal (NST)",
        cuando: "Desde semana 36",
        desc: "Controla latidos y movimientos del bebé en tiempo real.",
      },
      {
        id: "ecografia-crecimiento",
        nombre: "Ecografía de control de crecimiento",
        cuando: "Semana 32 a 36",
        desc: "Evalúa el peso estimado, posición y líquido amniótico.",
      },
      {
        id: "analisis-sangre-final",
        nombre: "Análisis de sangre final",
        cuando: "Semana 34 a 36",
        desc: "Incluye coagulograma, de cara al parto.",
      },
    ],
  },
];

export function loadRegistroExamenes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveRegistroExamenes(registro) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registro));
}
