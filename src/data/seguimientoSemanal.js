const sizes = [
  { emoji: "🔬", name: "óvulo no fecundado aún" }, // 1
  { emoji: "🔬", name: "ovulación en curso" }, // 2
  { emoji: "🔬", name: "fecundación reciente" }, // 3
  { emoji: "🌱", name: "una semilla de amapola" }, // 4
  { emoji: "🌱", name: "una semilla de sésamo" }, // 5
  { emoji: "🫘", name: "una lenteja" }, // 6
  { emoji: "🫐", name: "un arándano" }, // 7
  { emoji: "🍓", name: "una frambuesa" }, // 8
  { emoji: "🍇", name: "una uva" }, // 9
  { emoji: "🍊", name: "un kumquat" }, // 10
  { emoji: "🟣", name: "un higo" }, // 11
  { emoji: "🍋", name: "una lima" }, // 12
  { emoji: "🫛", name: "una vaina de arvejas" }, // 13
  { emoji: "🍋", name: "un limón" }, // 14
  { emoji: "🍎", name: "una manzana" }, // 15
  { emoji: "🥑", name: "un aguacate" }, // 16
  { emoji: "🥔", name: "un nabo" }, // 17
  { emoji: "🫑", name: "un pimiento" }, // 18
  { emoji: "🍅", name: "un tomate" }, // 19
  { emoji: "🍌", name: "una banana" }, // 20
  { emoji: "🥕", name: "una zanahoria" }, // 21
  { emoji: "🎃", name: "una calabaza espagueti" }, // 22
  { emoji: "🍊", name: "una toronja" }, // 23
  { emoji: "🌽", name: "una mazorca de maíz" }, // 24
  { emoji: "🥔", name: "una rutabaga" }, // 25
  { emoji: "🥒", name: "un pepino grande" }, // 26
  { emoji: "🥦", name: "una coliflor" }, // 27
  { emoji: "🍆", name: "una berenjena" }, // 28
  { emoji: "🎃", name: "una calabaza butternut" }, // 29
  { emoji: "🥬", name: "un repollo" }, // 30
  { emoji: "🥥", name: "un coco" }, // 31
  { emoji: "🥔", name: "una jícama" }, // 32
  { emoji: "🍍", name: "una piña" }, // 33
  { emoji: "🍈", name: "un melón cantaloupe" }, // 34
  { emoji: "🍈", name: "un melón verde" }, // 35
  { emoji: "🥬", name: "una lechuga romana" }, // 36
  { emoji: "🥬", name: "una acelga" }, // 37
  { emoji: "🥬", name: "un puerro" }, // 38
  { emoji: "🍉", name: "una sandía pequeña" }, // 39
  { emoji: "🎃", name: "una calabaza pequeña" }, // 40
];

const lengths = [
  null, null, null, null, null, null,
  1.3, 1.6, 2.3, 3.1, 4.1, 5.4, 7.4, 8.7, 10.1, 11.6, 13, 14.2, 15.3, 25.6,
  26.7, 27.8, 28.9, 30, 34.6, 35.6, 36.6, 37.6, 38.6, 39.9, 41.1, 42.4,
  43.7, 45, 46.2, 47.4, 48.6, 49.8, 50.7, 51.2,
];

const weights = [
  null, null, null, null, null, null,
  null, 1, 2, 4, 7, 14, 23, 43, 70, 100, 140, 190, 240, 300,
  360, 430, 501, 600, 660, 760, 875, 1005, 1153, 1319, 1502, 1702,
  1918, 2146, 2383, 2622, 2859, 3083, 3288, 3462,
];

const milestones = [
  "Tu ciclo comienza a contarse desde el primer día de tu última menstruación.",
  "Se produce la ovulación, el momento clave para la fecundación.",
  "La fecundación ocurre y comienza la división celular.",
  "El óvulo fecundado se implanta en el útero.",
  "Comienza a formarse el tubo neural.",
  "El corazón de tu bebé empieza a latir.",
  "Se forman los brazos y piernas como pequeños brotes.",
  "Todos los órganos principales comenzaron a desarrollarse.",
  "Los dedos de manos y pies empiezan a definirse.",
  "Los huesos y cartílagos se están formando.",
  "Tu bebé empieza a moverse, aunque todavía no lo sientas.",
  "Se completó el desarrollo de los órganos principales.",
  "Termina el primer trimestre. ¡Vas muy bien!",
  "Tu bebé puede hacer muecas y fruncir el ceño.",
  "Puede percibir la luz a través de los párpados cerrados.",
  "El sistema circulatorio y las vías urinarias ya funcionan.",
  "Comienza a acumular grasa corporal.",
  "Sus oídos están en posición final: puede empezar a escuchar.",
  "Se forma la vérnix caseosa que protege su piel.",
  "¡Mitad del camino! Es el momento típico de la ecografía morfológica.",
  "Sus movimientos son cada vez más fuertes y coordinados.",
  "Sus cejas y pestañas ya son visibles.",
  "Sus pulmones desarrollan los vasos sanguíneos para respirar.",
  "Alcanza un hito de viabilidad con cuidados médicos intensivos.",
  "Su piel comienza a volverse menos transparente.",
  "Sus ojos empiezan a abrirse.",
  "Responde a sonidos y reconoce tu voz.",
  "Empieza el tercer trimestre. Puede parpadear y entrar en fase de sueño REM.",
  "Sus músculos y pulmones siguen madurando.",
  "Su cerebro se desarrolla muy rápidamente.",
  "Puede girar la cabeza y sus huesos se endurecen, salvo el cráneo.",
  "Practica la respiración usando líquido amniótico.",
  "Los huesos de su cráneo permanecen blandos para facilitar el parto.",
  "Su sistema nervioso central sigue maduro y en desarrollo.",
  "Sus riñones están completamente desarrollados.",
  "Sigue ganando peso rápidamente de cara al parto.",
  "Se considera oficialmente 'a término temprano'.",
  "Sus órganos están listos para la vida fuera del útero.",
  "Se considera a término completo.",
  "¡Fecha probable de parto! Tu bebé está listo para nacer.",
];

const symptomSets = {
  1: [
    ["Náuseas matutinas", "Fatiga intensa", "Sensibilidad en los pechos"],
    ["Cambios de humor", "Aumento de la micción", "Aversión a ciertos olores"],
    ["Antojos", "Mareos leves", "Hinchazón abdominal"],
  ],
  2: [
    ["Más energía", "Aparece la línea morena", "Dolor en el ligamento redondo"],
    ["Congestión nasal", "Encías sensibles", "Primeros movimientos del bebé"],
    ["Aumento del apetito", "Calambres en las piernas", "Piel más luminosa"],
  ],
  3: [
    ["Dolor de espalda", "Hinchazón en pies y manos", "Falta de aire"],
    ["Contracciones de Braxton-Hicks", "Insomnio", "Acidez estomacal"],
    ["Mayor frecuencia urinaria", "Pesadez pélvica", "Dificultad para dormir cómoda"],
  ],
};

function trimesterOf(week) {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

export const totalWeeks = 40;

export function getWeekData(week) {
  const idx = week - 1;
  const trimester = trimesterOf(week);
  const variants = symptomSets[trimester];
  const symptoms = variants[idx % variants.length];

  return {
    week,
    trimester,
    size: sizes[idx],
    length: lengths[idx],
    weight: weights[idx],
    milestone: milestones[idx],
    symptoms,
  };
}
