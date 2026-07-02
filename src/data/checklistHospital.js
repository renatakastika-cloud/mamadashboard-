const STORAGE_KEY = "mama-dashboard:checklist-hospital";

export const checklistRecomendado = [
  {
    categoria: "Documentos",
    items: [
      "DNI / documento de identidad",
      "Carnet de obra social o seguro médico",
      "Historia clínica y carnet perinatal",
      "Resultados de estudios y ecografías",
      "Plan de parto impreso",
    ],
  },
  {
    categoria: "Para mamá",
    items: [
      "Camisón o ropa cómoda para el parto",
      "Bata y pantuflas",
      "Ropa interior descartable",
      "Toallas femeninas (apósitos posparto)",
      "Cargador de celular",
      "Neceser de higiene personal",
      "Ropa cómoda para la vuelta a casa",
    ],
  },
  {
    categoria: "Para el bebé",
    items: [
      "Body y mameluco para recién nacido",
      "Gorrito y medias",
      "Manta o mantita para envolver",
      "Pañales talla recién nacido",
      "Toallita para baño",
      "Ropa para la vuelta a casa",
      "Sistema de sujeción para el auto (silla de bebé)",
    ],
  },
  {
    categoria: "Contactos",
    items: [
      "Teléfono del médico/obstetra",
      "Teléfono del hospital o maternidad",
      "Contacto de la persona acompañante",
      "Contacto de emergencia familiar",
    ],
  },
];

export function loadChecklist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { marcados: [], propios: [] };
  } catch {
    return { marcados: [], propios: [] };
  }
}

export function saveChecklist(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
