import { useEffect, useState } from "react";
import Header from "./Header";
import {
  preguntasSugeridas,
  loadPrimeraConsulta,
  savePrimeraConsulta,
} from "../data/primeraConsultaPostparto";

export default function PrimeraConsultaPostparto({ onBack }) {
  const [marcadas, setMarcadas] = useState([]);
  const [propias, setPropias] = useState([]);
  const [nuevaPregunta, setNuevaPregunta] = useState("");

  useEffect(() => {
    const data = loadPrimeraConsulta();
    setMarcadas(data.marcadas);
    setPropias(data.propias);
  }, []);

  useEffect(() => {
    savePrimeraConsulta({ marcadas, propias });
  }, [marcadas, propias]);

  const toggle = (item) => {
    setMarcadas((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const agregarPropia = () => {
    const texto = nuevaPregunta.trim();
    if (!texto) return;
    setPropias((prev) => [...prev, { id: Date.now().toString(), texto }]);
    setNuevaPregunta("");
  };

  const eliminarPropia = (id) => {
    setPropias((prev) => prev.filter((p) => p.id !== id));
    setMarcadas((prev) => prev.filter((x) => x !== id));
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
        title="💬 Primera consulta postparto"
        subtitle="Qué preguntar, qué esperar — armá tu lista para no olvidarte nada"
      />

      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Preguntas sugeridas
        </p>
        <ul className="space-y-2 mb-6">
          {preguntasSugeridas.map((p) => {
            const checked = marcadas.includes(p);
            return (
              <li key={p}>
                <button
                  onClick={() => toggle(p)}
                  className="flex items-center gap-2 w-full text-left text-sm"
                >
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                      checked ? "bg-rose-500 border-rose-500 text-white" : "border-rose-200"
                    }`}
                  >
                    {checked && "✓"}
                  </span>
                  <span className={checked ? "text-gray-400 line-through" : "text-gray-700"}>
                    {p}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Tus propias preguntas
        </p>

        {propias.length > 0 && (
          <ul className="space-y-2 mb-4">
            {propias.map((p) => {
              const checked = marcadas.includes(p.id);
              return (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggle(p.id)}
                    className="flex items-center gap-2 text-left text-sm flex-1"
                  >
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        checked ? "bg-rose-500 border-rose-500 text-white" : "border-rose-200"
                      }`}
                    >
                      {checked && "✓"}
                    </span>
                    <span className={checked ? "text-gray-400 line-through" : "text-gray-700"}>
                      {p.texto}
                    </span>
                  </button>
                  <button
                    onClick={() => eliminarPropia(p.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaPregunta}
            onChange={(e) => setNuevaPregunta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarPropia()}
            placeholder="Ej: ¿es normal esta molestia en...?"
            className="flex-1 border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
          />
          <button
            onClick={agregarPropia}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors whitespace-nowrap"
          >
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
