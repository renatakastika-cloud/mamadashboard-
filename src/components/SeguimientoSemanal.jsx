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

export default function SeguimientoSemanal({ onBack }) {
  const [week, setWeek] = useState(24);

  const data = getWeekData(week);
  const color = trimesterColor[data.trimester];

  useEffect(() => {
    loadPerfil().then((p) => setWeek(p.semanaActual));
  }, []);

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
        subtitle="Ficha del bebé semana a semana. Registrá cómo te sentiste desde el botón + en Inicio."
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
        Síntomas esperados esta semana
      </h3>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.symptoms.map((s) => (
            <div
              key={s}
              className="text-sm text-left rounded-xl px-3 py-2 border border-rose-100 bg-rose-50 text-gray-700"
            >
              {s}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Podés marcar cuáles tuviste vos en el registro del día, desde el botón + en Inicio.
        </p>
      </div>
    </div>
  );
}
