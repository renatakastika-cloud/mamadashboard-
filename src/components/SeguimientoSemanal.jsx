import { useEffect, useState } from "react";
import Header from "./Header";
import { getWeekData, totalWeeks } from "../data/seguimientoSemanal";
import { loadPerfil } from "../data/perfil";

const trimesterLabel = { 1: "1er trimestre", 2: "2do trimestre", 3: "3er trimestre" };
const trimesterColor = {
  1: { bg: "#fde7ef", text: "#f43f8c" },
  2: { bg: "#ede9fe", text: "#8b6fd9" },
  3: { bg: "#fff4e5", text: "#d97706" },
};

const STORAGE_KEY = "mama-dashboard:registro-semanal";

const animoOpciones = [
  { value: 1, emoji: "😢" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

const escalaOpciones = [1, 2, 3, 4, 5];

function loadRegistro() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveRegistro(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function SeguimientoSemanal({ onBack }) {
  const [week, setWeek] = useState(() => loadPerfil().semanaActual);
  const [registro, setRegistro] = useState({});
  const [saved, setSaved] = useState(false);

  const data = getWeekData(week);
  const color = trimesterColor[data.trimester];

  useEffect(() => {
    const all = loadRegistro();
    setRegistro(
      all[week] || { sintomas: [], nota: "", animo: null, energia: null, sueno: null }
    );
    setSaved(false);
  }, [week]);

  const toggleSintoma = (s) => {
    setRegistro((prev) => {
      const sintomas = prev.sintomas.includes(s)
        ? prev.sintomas.filter((x) => x !== s)
        : [...prev.sintomas, s];
      return { ...prev, sintomas };
    });
    setSaved(false);
  };

  const updateField = (field, value) => {
    setRegistro((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const updateNota = (nota) => updateField("nota", nota);

  const handleGuardar = () => {
    const all = loadRegistro();
    all[week] = registro;
    saveRegistro(all);
    setSaved(true);
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
      >
        ← Volver a Mi Embarazo
      </button>

      <Header
        title="📅 Seguimiento semanal"
        subtitle="Ficha del bebé semana a semana + registro de cómo te sentiste tú"
      />

      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Semana {week} de {totalWeeks}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: color.bg, color: color.text }}
          >
            {trimesterLabel[data.trimester]}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={totalWeeks}
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="w-full accent-rose-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>S.1</span>
          <span>S.20</span>
          <span>S.40</span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Tu bebé esta semana
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl p-6 text-white shadow-sm">
          <p className="text-sm opacity-90">Tu bebé esta semana es del tamaño de</p>
          <p className="text-3xl font-semibold mt-1">
            {data.size.emoji} {data.size.name}
          </p>
          {(data.length || data.weight) && (
            <p className="text-sm opacity-90 mt-2">
              {data.length ? `≈ ${data.length} cm` : ""}
              {data.length && data.weight ? " · " : ""}
              {data.weight ? `≈ ${data.weight} g` : ""}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
          <p className="text-sm text-gray-500 mb-2">Hito de desarrollo</p>
          <p className="text-sm text-gray-800 leading-relaxed">{data.milestone}</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        ¿Cómo te sentiste tú esta semana?
      </h3>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
        <p className="text-sm text-gray-500 mb-3">
          Ficha rápida — tocá las opciones, te toma unos segundos
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 mb-2">Estado de ánimo</p>
            <div className="flex gap-2">
              {animoOpciones.map((o) => (
                <button
                  key={o.value}
                  onClick={() => updateField("animo", o.value)}
                  className={`text-xl w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${
                    registro.animo === o.value
                      ? "bg-rose-500 border-rose-500"
                      : "bg-rose-50 border-rose-100 hover:border-rose-300"
                  }`}
                >
                  {o.emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Nivel de energía (1-5)</p>
            <div className="flex gap-2">
              {escalaOpciones.map((n) => (
                <button
                  key={n}
                  onClick={() => updateField("energia", n)}
                  className={`text-sm w-9 h-9 rounded-full border font-medium transition-colors ${
                    registro.energia === n
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-rose-50 text-gray-700 border-rose-100 hover:border-rose-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Calidad del sueño (1-5)</p>
            <div className="flex gap-2">
              {escalaOpciones.map((n) => (
                <button
                  key={n}
                  onClick={() => updateField("sueno", n)}
                  className={`text-sm w-9 h-9 rounded-full border font-medium transition-colors ${
                    registro.sueno === n
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-rose-50 text-gray-700 border-rose-100 hover:border-rose-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-2">Síntomas esperados que tuviste</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {data.symptoms.map((s) => {
            const checked = registro.sintomas?.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSintoma(s)}
                className={`text-sm text-left rounded-xl px-3 py-2 border transition-colors ${
                  checked
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-rose-50 text-gray-700 border-rose-100 hover:border-rose-300"
                }`}
              >
                {checked ? "✓ " : ""}{s}
              </button>
            );
          })}
        </div>

        <label className="text-sm text-gray-500 block mb-1">Notas de la semana (opcional)</label>
        <textarea
          value={registro.nota || ""}
          onChange={(e) => updateNota(e.target.value)}
          placeholder="Ej: tuve un poco de hinchazón en los pies por la tarde..."
          className="w-full border border-rose-100 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-rose-300 resize-none"
          rows={3}
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleGuardar}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Guardar registro de la semana
          </button>
          {saved && <span className="text-sm text-green-600">Guardado ✓</span>}
        </div>
      </div>
    </div>
  );
}
