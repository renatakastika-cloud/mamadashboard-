import { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import {
  examenesPorTrimestre,
  loadRegistroExamenes,
  saveRegistroExamenes,
} from "../data/examenesSemanales";
import { getWeekData } from "../data/seguimientoSemanal";
import { loadPerfil } from "../data/perfil";

export default function GuiaExamenes({ onBack }) {
  const [trimestreActual, setTrimestreActual] = useState(null);
  const [registro, setRegistro] = useState({});

  useEffect(() => {
    loadPerfil().then((p) => setTrimestreActual(getWeekData(p.semanaActual).trimester));
    setRegistro(loadRegistroExamenes());
  }, []);

  const bloquesVisibles = useMemo(() => {
    if (!trimestreActual) return [];
    return examenesPorTrimestre.filter((b) => b.trimestre <= trimestreActual);
  }, [trimestreActual]);

  const { totalHechos, totalExamenes } = useMemo(() => {
    const todos = bloquesVisibles.flatMap((b) => b.examenes);
    return {
      totalExamenes: todos.length,
      totalHechos: todos.filter((ex) => registro[ex.id]?.hecho).length,
    };
  }, [bloquesVisibles, registro]);

  const actualizarExamen = (id, campo, valor) => {
    setRegistro((prev) => {
      const next = { ...prev, [id]: { ...prev[id], [campo]: valor } };
      saveRegistroExamenes(next);
      return next;
    });
  };

  const handleArchivo = (id, fileList) => {
    const file = fileList[0];
    if (!file) return;
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("El archivo supera los 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      actualizarExamen(id, "archivo", {
        id: `${Date.now()}-${file.name}`,
        nombre: file.name,
        tipo: file.type,
        dataUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const eliminarArchivo = (id) => {
    actualizarExamen(id, "archivo", null);
  };

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
        >
          ← Volver a Citas
        </button>
      )}

      <Header
        title="🧪 Guía de exámenes por semana"
        subtitle="Marcá los que ya te hiciste, guardá el resultado y adjuntá el estudio"
      />

      {trimestreActual && (
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {totalHechos} de {totalExamenes} listo
            </p>
            <span className="text-sm font-semibold text-rose-500">
              {totalExamenes === 0 ? 0 : Math.round((totalHechos / totalExamenes) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-rose-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all"
              style={{
                width: `${totalExamenes === 0 ? 0 : Math.round((totalHechos / totalExamenes) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {bloquesVisibles.map((bloque) => {
          const esActual = bloque.trimestre === trimestreActual;
          return (
            <div key={bloque.trimestre}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold text-gray-700">
                  {bloque.trimestre}er trimestre
                </p>
                <span className="text-xs text-gray-400">{bloque.rango}</span>
                {esActual && (
                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                    tu trimestre actual
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {bloque.examenes.map((ex) => {
                  const datos = registro[ex.id] || {};
                  return (
                    <div
                      key={ex.id}
                      className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm"
                    >
                      <button
                        onClick={() => actualizarExamen(ex.id, "hecho", !datos.hecho)}
                        className="flex items-start gap-3 w-full text-left"
                      >
                        <span
                          className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                            datos.hecho ? "bg-rose-500 border-rose-500 text-white" : "border-rose-200"
                          }`}
                        >
                          {datos.hecho && "✓"}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-medium ${
                                datos.hecho ? "text-gray-400 line-through" : "text-gray-800"
                              }`}
                            >
                              {ex.nombre}
                            </span>
                            <span className="text-xs text-rose-500 whitespace-nowrap">
                              {ex.cuando}
                            </span>
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">{ex.desc}</span>
                        </span>
                      </button>

                      <div className="mt-3 ml-8 space-y-2">
                        <textarea
                          value={datos.resultado || ""}
                          onChange={(e) => actualizarExamen(ex.id, "resultado", e.target.value)}
                          placeholder="Resultado / lo que te dio (opcional)"
                          className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300 resize-none"
                          rows={2}
                        />

                        {datos.archivo ? (
                          <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                            <a
                              href={datos.archivo.dataUrl}
                              download={datos.archivo.nombre}
                              className="text-sm text-gray-700 hover:text-rose-600 truncate mr-3"
                            >
                              📄 {datos.archivo.nombre}
                            </a>
                            <button
                              onClick={() => eliminarArchivo(ex.id)}
                              className="text-xs text-gray-400 hover:text-red-500 whitespace-nowrap"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : (
                          <label className="inline-block text-xs text-rose-500 hover:underline cursor-pointer">
                            📎 Adjuntar estudio
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => handleArchivo(ex.id, e.target.files)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
