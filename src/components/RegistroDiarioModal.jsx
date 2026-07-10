import { useState } from "react";
import {
  animoOpciones,
  escalaOpciones,
  loadRegistroDelDia,
  guardarRegistroDelDia,
} from "../data/registroDiario";
import { prompts, nuevoPromptAleatorio } from "../data/diarioLibre";
import { catalogoSintomas, iconoSintoma } from "../data/sintomas";

function formatFechaLarga(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export default function RegistroDiarioModal({ fecha, sintomasSemana = [], onClose, onSaved }) {
  const existente = loadRegistroDelDia(fecha);

  const [animo, setAnimo] = useState(existente?.animo ?? null);
  const [energia, setEnergia] = useState(existente?.energia ?? null);
  const [sueno, setSueno] = useState(existente?.sueno ?? null);
  const [sintomas, setSintomas] = useState(existente?.sintomas ?? []);
  const [nota, setNota] = useState(existente?.nota ?? "");
  const [mostrarConsigna, setMostrarConsigna] = useState(false);
  const [prompt, setPrompt] = useState(existente?.prompt ?? null);
  const [archivos, setArchivos] = useState(existente?.archivos ?? []);
  const [mostrarMasSintomas, setMostrarMasSintomas] = useState(false);
  const [sintomaPropio, setSintomaPropio] = useState("");

  const toggleSintoma = (s) => {
    setSintomas((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const agregarSintomaPropio = () => {
    const valor = sintomaPropio.trim();
    if (!valor) return;
    if (!sintomas.includes(valor)) setSintomas((prev) => [...prev, valor]);
    setSintomaPropio("");
  };

  const catalogoRestante = catalogoSintomas.filter((s) => !sintomasSemana.includes(s.label));
  const sintomasPropios = sintomas.filter(
    (s) => !sintomasSemana.includes(s) && !catalogoSintomas.some((c) => c.label === s)
  );

  const toggleConsigna = () => {
    if (!mostrarConsigna) setPrompt((p) => p || prompts[Math.floor(Math.random() * prompts.length)]);
    setMostrarConsigna((v) => !v);
  };

  const handleArchivos = (fileList) => {
    const files = Array.from(fileList);
    const maxSize = 4 * 1024 * 1024;
    const validos = files.filter((f) => f.size <= maxSize);
    const muyGrandes = files.length - validos.length;

    Promise.all(
      validos.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: `${Date.now()}-${file.name}`,
                nombre: file.name,
                tipo: file.type,
                dataUrl: reader.result,
              });
            reader.readAsDataURL(file);
          })
      )
    ).then((nuevos) => {
      setArchivos((prev) => [...prev, ...nuevos]);
      if (muyGrandes > 0) alert(`${muyGrandes} archivo(s) no se adjuntaron por superar los 4MB.`);
    });
  };

  const eliminarArchivo = (id) => {
    setArchivos((prev) => prev.filter((a) => a.id !== id));
  };

  const handleGuardar = () => {
    guardarRegistroDelDia(fecha, {
      animo,
      energia,
      sueno,
      sintomas,
      nota: nota.trim(),
      prompt: mostrarConsigna ? prompt : null,
      archivos,
    });
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-900">Registro del día</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>
        <p className="text-xs text-gray-500 capitalize mb-4">{formatFechaLarga(fecha)}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 mb-2">Estado de ánimo</p>
            <div className="flex gap-2">
              {animoOpciones.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setAnimo(o.value)}
                  className={`text-xl w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${
                    animo === o.value
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
            <p className="text-xs text-gray-500 mb-2">Energía (1-5)</p>
            <div className="flex gap-2">
              {escalaOpciones.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergia(n)}
                  className={`text-sm w-9 h-9 rounded-full border font-medium transition-colors ${
                    energia === n
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
            <p className="text-xs text-gray-500 mb-2">Sueño (1-5)</p>
            <div className="flex gap-2">
              {escalaOpciones.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSueno(n)}
                  className={`text-sm w-9 h-9 rounded-full border font-medium transition-colors ${
                    sueno === n
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

        <p className="text-xs text-gray-500 mb-2">Síntomas que tuviste</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {sintomasSemana.map((s) => {
            const checked = sintomas.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSintoma(s)}
                className={`text-sm text-left rounded-xl px-3 py-2 border transition-colors flex items-center gap-1.5 ${
                  checked
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-rose-50 text-gray-700 border-rose-100 hover:border-rose-300"
                }`}
              >
                <span>{iconoSintoma(s)}</span>
                {s}
              </button>
            );
          })}

          {sintomasPropios.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSintoma(s)}
              className="text-sm text-left rounded-xl px-3 py-2 border bg-rose-500 text-white border-rose-500 flex items-center gap-1.5"
            >
              <span>📝</span>
              {s}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setMostrarMasSintomas((v) => !v)}
            className="text-sm rounded-xl px-3 py-2 border border-dashed border-rose-200 text-rose-500 hover:border-rose-400 transition-colors"
          >
            {mostrarMasSintomas ? "− Menos síntomas" : "+ Más síntomas"}
          </button>
        </div>

        {mostrarMasSintomas && (
          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 mb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {catalogoRestante.map((s) => {
                const checked = sintomas.includes(s.label);
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => toggleSintoma(s.label)}
                    className={`text-xs text-left rounded-xl px-2.5 py-1.5 border transition-colors flex items-center gap-1 ${
                      checked
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white text-gray-700 border-rose-100 hover:border-rose-300"
                    }`}
                  >
                    <span>{s.icon}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 mb-1">¿No está en la lista? Escribilo vos</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={sintomaPropio}
                onChange={(e) => setSintomaPropio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    agregarSintomaPropio();
                  }
                }}
                placeholder="Ej: hormigueo en las manos"
                className="flex-1 border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
              />
              <button
                type="button"
                onClick={agregarSintomaPropio}
                className="text-sm font-medium px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={toggleConsigna}
          className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors mb-3 ${
            mostrarConsigna
              ? "bg-rose-500 text-white border-rose-500"
              : "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300"
          }`}
        >
          💭 {mostrarConsigna ? "Usando una consigna" : "Usar una consigna"}
        </button>

        {mostrarConsigna && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-800 italic">"{prompt}"</p>
            <button
              type="button"
              onClick={() => setPrompt(nuevoPromptAleatorio(prompt))}
              className="text-xs text-rose-500 hover:underline whitespace-nowrap"
            >
              Cambiar
            </button>
          </div>
        )}

        <label className="text-sm text-gray-500 block mb-1">Notas del día (opcional)</label>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Escribí lo que quieras, esto es solo para vos..."
          className="w-full border border-rose-100 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-rose-300 resize-none mb-3"
          rows={4}
        />

        <label className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium px-3 py-2 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors mb-3">
          📷 Foto / archivo
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files.length) handleArchivos(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>

        {archivos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {archivos.map((a) => (
              <div key={a.id} className="relative">
                {a.tipo.startsWith("image/") ? (
                  <img
                    src={a.dataUrl}
                    alt={a.nombre}
                    className="w-16 h-16 object-cover rounded-xl border border-rose-100"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-xl text-xs text-gray-500 text-center px-1">
                    📄
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => eliminarArchivo(a.id)}
                  className="absolute -top-1.5 -right-1.5 bg-white border border-rose-200 rounded-full w-5 h-5 flex items-center justify-center text-xs text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">🔒 Privado, solo vos podés verlo</p>
          <button
            type="button"
            onClick={handleGuardar}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
