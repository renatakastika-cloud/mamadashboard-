import { useEffect, useMemo, useState } from "react";
import {
  loadEntradas,
  saveEntradas,
  nuevoPromptAleatorio,
  toISODate,
  weekdayLabels,
  weekdayLabelsLargo,
  getWeekDates,
  formatRangoSemana,
} from "../data/diarioLibre";

export default function DiarioLibre() {
  const today = useMemo(() => new Date(), []);
  const [refDate, setRefDate] = useState(today);
  const [selected, setSelected] = useState(toISODate(today));
  const [entradas, setEntradas] = useState([]);

  const [mostrarConsigna, setMostrarConsigna] = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [texto, setTexto] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    setEntradas(loadEntradas());
  }, []);

  const diasSemana = useMemo(() => getWeekDates(refDate), [refDate]);

  const entradasPorFecha = useMemo(() => {
    const map = {};
    entradas.forEach((e) => {
      map[e.fecha] = map[e.fecha] || [];
      map[e.fecha].push(e);
    });
    return map;
  }, [entradas]);

  const entradasDelDia = entradasPorFecha[selected] || [];
  const todayISO = toISODate(today);

  const cambiarSemana = (delta) => {
    const next = new Date(refDate);
    next.setDate(refDate.getDate() + delta * 7);
    setRefDate(next);
  };

  const toggleConsigna = () => {
    if (!mostrarConsigna) setPrompt(nuevoPromptAleatorio());
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

  const eliminarArchivoNuevo = (id) => {
    setArchivos((prev) => prev.filter((a) => a.id !== id));
  };

  const handleGuardar = () => {
    const texto2 = texto.trim();
    if (!texto2 && archivos.length === 0) return;
    const nueva = {
      id: Date.now().toString(),
      fecha: selected,
      hora: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      prompt: mostrarConsigna ? prompt : null,
      texto: texto2,
      archivos,
    };
    const next = [nueva, ...entradas];
    setEntradas(next);
    saveEntradas(next);
    setTexto("");
    setArchivos([]);
    setMostrarConsigna(false);
  };

  const eliminarEntrada = (id) => {
    const next = entradas.filter((e) => e.id !== id);
    setEntradas(next);
    saveEntradas(next);
    if (abierta === id) setAbierta(null);
  };

  return (
    <div>
      {/* Navegación semanal */}
      <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => cambiarSemana(-1)} className="text-gray-400 hover:text-rose-500 px-2">
            ←
          </button>
          <p className="text-sm font-medium text-gray-800">{formatRangoSemana(diasSemana)}</p>
          <button onClick={() => cambiarSemana(1)} className="text-gray-400 hover:text-rose-500 px-2">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {diasSemana.map((d, i) => {
            const iso = toISODate(d);
            const isSelected = iso === selected;
            const isToday = iso === todayISO;
            const tieneEntradas = (entradasPorFecha[iso] || []).length > 0;
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={`relative rounded-xl py-2 flex flex-col items-center transition-colors ${
                  isSelected
                    ? "bg-rose-500 text-white"
                    : isToday
                    ? "bg-rose-100 text-rose-600 font-semibold"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <span className="text-[10px] uppercase">{weekdayLabels[i]}</span>
                <span className="text-sm">{d.getDate()}</span>
                {tieneEntradas && (
                  <span
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-rose-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {weekdayLabelsLargo[(new Date(selected).getDay() + 6) % 7]}{" "}
        {new Date(selected).getDate()}
      </p>

      {/* Compositor */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm mb-6">
        <button
          onClick={toggleConsigna}
          className={`text-sm font-medium px-4 py-2 rounded-xl border transition-colors mb-4 ${
            mostrarConsigna
              ? "bg-rose-500 text-white border-rose-500"
              : "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300"
          }`}
        >
          💭 {mostrarConsigna ? "Usando una consigna" : "Usar una consigna"}
        </button>

        {mostrarConsigna && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-800 italic">"{prompt}"</p>
            <button
              onClick={() => setPrompt(nuevoPromptAleatorio(prompt))}
              className="text-xs text-rose-500 hover:underline whitespace-nowrap"
            >
              Cambiar
            </button>
          </div>
        )}

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí lo que quieras, esto es solo para vos..."
          className="w-full border border-rose-100 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-rose-300 resize-none mb-4"
          rows={6}
        />

        <div className="flex items-center gap-2 mb-4">
          <label className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium px-3 py-2 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors">
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
        </div>

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
                  onClick={() => eliminarArchivoNuevo(a.id)}
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
            onClick={handleGuardar}
            disabled={!texto.trim() && archivos.length === 0}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar entrada
          </button>
        </div>
      </div>

      {/* Entradas del día */}
      {entradasDelDia.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no escribiste nada este día.</p>
      ) : (
        <ul className="space-y-3">
          {entradasDelDia.map((e) => {
            const expandida = abierta === e.id;
            return (
              <li key={e.id} className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm">
                <button onClick={() => setAbierta(expandida ? null : e.id)} className="w-full text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{e.hora}</p>
                    <span className="text-xs text-rose-500">{expandida ? "Ocultar" : "Leer"}</span>
                  </div>
                  {e.prompt && <p className="text-xs text-rose-500 italic mt-1">"{e.prompt}"</p>}
                  {e.texto && (
                    <p className={`text-sm text-gray-700 mt-2 ${expandida ? "" : "line-clamp-2"}`}>
                      {e.texto}
                    </p>
                  )}
                </button>

                {e.archivos?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {e.archivos.map((a) =>
                      a.tipo.startsWith("image/") ? (
                        <img
                          key={a.id}
                          src={a.dataUrl}
                          alt={a.nombre}
                          className="w-16 h-16 object-cover rounded-xl border border-rose-100"
                        />
                      ) : (
                        <a
                          key={a.id}
                          href={a.dataUrl}
                          download={a.nombre}
                          className="w-16 h-16 flex items-center justify-center bg-rose-50 border border-rose-100 rounded-xl text-xs text-gray-500"
                        >
                          📄
                        </a>
                      )
                    )}
                  </div>
                )}

                {expandida && (
                  <button
                    onClick={() => eliminarEntrada(e.id)}
                    className="text-xs text-gray-400 hover:text-red-500 mt-3"
                  >
                    Eliminar entrada
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
