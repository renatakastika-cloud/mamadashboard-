import { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import {
  checklistRecomendado,
  loadChecklist,
  saveChecklist,
} from "../data/checklistHospital";

export default function ChecklistHospital({ onBack }) {
  const [marcados, setMarcados] = useState([]);
  const [propios, setPropios] = useState([]);
  const [nuevoItem, setNuevoItem] = useState("");

  useEffect(() => {
    const data = loadChecklist();
    setMarcados(data.marcados);
    setPropios(data.propios);
  }, []);

  useEffect(() => {
    saveChecklist({ marcados, propios });
  }, [marcados, propios]);

  const toggle = (item) => {
    setMarcados((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const agregarPropio = () => {
    const texto = nuevoItem.trim();
    if (!texto) return;
    setPropios((prev) => [...prev, { id: Date.now().toString(), texto }]);
    setNuevoItem("");
  };

  const eliminarPropio = (id) => {
    setPropios((prev) => prev.filter((p) => p.id !== id));
    setMarcados((prev) => prev.filter((x) => x !== id));
  };

  const totalItems = useMemo(
    () => checklistRecomendado.reduce((acc, c) => acc + c.items.length, 0) + propios.length,
    [propios]
  );
  const totalMarcados = marcados.length;
  const progreso = totalItems === 0 ? 0 : Math.round((totalMarcados / totalItems) * 100);

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
      >
        ← Volver a Mi Perfil
      </button>

      <Header
        title="🎒 Checklist del hospital"
        subtitle="Bolsa, documentos y contactos — recomendaciones que podés tachar o ampliar"
      />

      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            {totalMarcados} de {totalItems} listo
          </p>
          <span className="text-sm font-semibold text-rose-500">{progreso}%</span>
        </div>
        <div className="w-full h-2 bg-rose-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {checklistRecomendado.map((cat) => (
          <div key={cat.categoria} className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {cat.categoria}
            </p>
            <ul className="space-y-2">
              {cat.items.map((item) => {
                const checked = marcados.includes(item);
                return (
                  <li key={item}>
                    <button
                      onClick={() => toggle(item)}
                      className="flex items-center gap-2 w-full text-left text-sm"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                          checked
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "border-rose-200"
                        }`}
                      >
                        {checked && "✓"}
                      </span>
                      <span className={checked ? "text-gray-400 line-through" : "text-gray-700"}>
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm sm:col-span-2">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tus propios ítems
          </p>

          {propios.length > 0 && (
            <ul className="space-y-2 mb-4">
              {propios.map((p) => {
                const checked = marcados.includes(p.id);
                return (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggle(p.id)}
                      className="flex items-center gap-2 text-left text-sm flex-1"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                          checked
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "border-rose-200"
                        }`}
                      >
                        {checked && "✓"}
                      </span>
                      <span className={checked ? "text-gray-400 line-through" : "text-gray-700"}>
                        {p.texto}
                      </span>
                    </button>
                    <button
                      onClick={() => eliminarPropio(p.id)}
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
              value={nuevoItem}
              onChange={(e) => setNuevoItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarPropio()}
              placeholder="Ej: cámara de fotos, almohada de lactancia..."
              className="flex-1 border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
            />
            <button
              onClick={agregarPropio}
              className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors whitespace-nowrap"
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
