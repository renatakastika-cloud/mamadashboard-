import { useEffect, useState } from "react";
import Header from "./Header";
import {
  loadContracciones,
  guardarContraccion,
  limpiarContracciones,
  formatearDuracion,
} from "../data/contracciones";
import { regla511 } from "../data/estoyDeParto";

export default function ContadorContracciones({ onBack }) {
  const [contracciones, setContracciones] = useState([]);
  const [enCurso, setEnCurso] = useState(false);
  const [inicio, setInicio] = useState(null);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    setContracciones(loadContracciones());
  }, []);

  useEffect(() => {
    if (!enCurso) return;
    const interval = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [enCurso]);

  const iniciarContraccion = () => {
    setInicio(Date.now());
    setSegundos(0);
    setEnCurso(true);
  };

  const finalizarContraccion = () => {
    const anterior = contracciones[0];
    const nueva = {
      id: Date.now().toString(),
      hora: new Date(inicio).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      inicio,
      duracionSeg: segundos,
      intervaloSeg: anterior ? Math.round((inicio - anterior.inicio) / 1000) : null,
    };
    setContracciones(guardarContraccion(nueva));
    setEnCurso(false);
    setSegundos(0);
    setInicio(null);
  };

  const handleReiniciar = () => {
    setContracciones(limpiarContracciones());
  };

  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
        >
          ← Volver a Inicio
        </button>
      )}

      <Header
        title="⏱️ Contador de contracciones"
        subtitle="Cronometrá cada contracción y su intervalo con la anterior"
      />

      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 max-w-xl">
        <p className="text-sm font-semibold text-gray-700 mb-1">{regla511.titulo}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{regla511.desc}</p>
      </div>

      <div className="bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl p-6 text-white shadow-sm mb-6 max-w-sm">
        {!enCurso ? (
          <div className="text-center">
            <p className="text-sm opacity-90 mb-4">
              Tocá el botón apenas empiece la contracción.
            </p>
            <button
              onClick={iniciarContraccion}
              className="bg-white text-rose-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-rose-50 transition-colors"
            >
              Iniciar contracción
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm opacity-90 mb-1">Duración</p>
            <p className="text-4xl font-semibold mb-4">{mm}:{ss}</p>
            <button
              onClick={finalizarContraccion}
              className="bg-white text-rose-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-rose-50 transition-colors"
            >
              Terminó la contracción
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3 max-w-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Registro de hoy
        </h3>
        {contracciones.length > 0 && (
          <button
            onClick={handleReiniciar}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            Reiniciar registro
          </button>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm max-w-sm">
        {contracciones.length === 0 ? (
          <p className="text-sm text-gray-400">Todavía no registraste ninguna contracción.</p>
        ) : (
          <ul className="space-y-2">
            {contracciones.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between text-sm border border-rose-100 rounded-xl px-3 py-2"
              >
                <span className="text-gray-700">{c.hora}</span>
                <span className="text-gray-500">
                  {formatearDuracion(c.duracionSeg)}
                  {c.intervaloSeg != null && ` · cada ${formatearDuracion(c.intervaloSeg)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
