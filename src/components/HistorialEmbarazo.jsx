import { useMemo } from "react";
import Header from "./Header";
import { loadRegistros, animoOpciones } from "../data/registroDiario";
import { iconoSintoma } from "../data/sintomas";

function emojiAnimo(valor) {
  return animoOpciones.find((o) => o.value === valor)?.emoji || null;
}

export default function HistorialEmbarazo({ onBack }) {
  const entradas = useMemo(() => {
    const registros = loadRegistros();
    return Object.values(registros).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, []);

  const handleExportar = () => {
    window.print();
  };

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="no-print text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
        >
          ← Volver a Mi Perfil
        </button>
      )}

      <div className="no-print">
        <div className="flex items-start justify-between">
          <Header
            title="📖 Historial de mi embarazo"
            subtitle="Todo lo que fuiste registrando desde Inicio, en un solo lugar"
          />
          <button
            onClick={handleExportar}
            className="bg-white border border-rose-300 text-rose-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            Exportar / Imprimir PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
          {entradas.length === 0 ? (
            <p className="text-sm text-gray-400">
              Todavía no registraste ningún día. Hacelo desde el botón + en Inicio.
            </p>
          ) : (
            <ul className="space-y-3">
              {entradas.map((r) => (
                <li key={r.fecha} className="border-b border-rose-50 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-700">{r.fecha}</p>
                    {emojiAnimo(r.animo) && <span className="text-base">{emojiAnimo(r.animo)}</span>}
                  </div>
                  {r.sintomas?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {r.sintomas.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-rose-50 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {iconoSintoma(s)} {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.nota && <p className="text-xs text-gray-500">{r.nota}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <HistorialPreview entradas={entradas} />
    </div>
  );
}

function HistorialPreview({ entradas }) {
  return (
    <div className="print-only text-gray-900 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold mb-1">Historial de embarazo</h1>
      <p className="text-gray-500 mb-6">
        Exportado el {new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <h2 className="font-semibold mt-4 mb-1">Registro diario</h2>
      {entradas.length === 0 ? (
        <p>—</p>
      ) : (
        <ul>
          {entradas.map((r) => (
            <li key={r.fecha} className="mb-2">
              <strong>{r.fecha}</strong>
              {r.sintomas?.length > 0 ? ` — ${r.sintomas.join(", ")}` : ""}
              {r.nota ? ` (${r.nota})` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
