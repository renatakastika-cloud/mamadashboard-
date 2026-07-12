import { useEffect, useState } from "react";
import { loadEntradaDelDia, guardarEntradaDelDia, eliminarEntrada } from "../data/diario";
import { prompts, nuevoPromptAleatorio } from "../data/diarioLibre";
import {
  diarioDesbloqueado,
  descifrarConClave,
  cifrarConClave,
  tienePassword,
} from "../data/diarioSeguridad";
import DesbloqueoDiarioModal from "./DesbloqueoDiarioModal";

function formatFechaLarga(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

function parseContenidoCifrado(plano) {
  try {
    const obj = JSON.parse(plano);
    return { titulo: obj.titulo || "", texto: obj.texto || "" };
  } catch {
    return { titulo: "", texto: plano };
  }
}

export default function EscribirEntradaModal({ fecha, onClose, onSaved }) {
  const existente = loadEntradaDelDia(fecha);
  const eraPrivada = Boolean(existente?.privada);

  const [bloqueado, setBloqueado] = useState(eraPrivada && !diarioDesbloqueado());
  const [cargando, setCargando] = useState(eraPrivada && diarioDesbloqueado());
  const [titulo, setTitulo] = useState(eraPrivada ? "" : existente?.titulo ?? "");
  const [texto, setTexto] = useState(eraPrivada ? "" : existente?.texto ?? "");
  const [mostrarConsigna, setMostrarConsigna] = useState(Boolean(existente?.prompt));
  const [prompt, setPrompt] = useState(existente?.prompt ?? null);
  const [archivos, setArchivos] = useState(existente?.archivos ?? []);
  const [destacado, setDestacado] = useState(existente?.destacado ?? false);
  const [oculto, setOculto] = useState(existente?.oculto ?? false);
  const [privada, setPrivada] = useState(eraPrivada);
  const [mostrarDesbloqueo, setMostrarDesbloqueo] = useState(null);

  useEffect(() => {
    if (!eraPrivada || !diarioDesbloqueado()) return;
    descifrarConClave(existente.textoCifrado).then((plano) => {
      const { titulo: t, texto: x } = parseContenidoCifrado(plano);
      setTitulo(t);
      setTexto(x);
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleTogglePrivada = () => {
    if (privada) {
      setPrivada(false);
      return;
    }
    if (!tienePassword()) {
      setMostrarDesbloqueo("crear");
      return;
    }
    if (!diarioDesbloqueado()) {
      setMostrarDesbloqueo("desbloquear");
      return;
    }
    setPrivada(true);
  };

  const handleGuardar = async () => {
    const payload = {
      prompt: mostrarConsigna ? prompt : null,
      archivos,
      destacado,
      oculto,
      privada,
    };

    if (privada) {
      if (!diarioDesbloqueado()) {
        setMostrarDesbloqueo("desbloquear");
        return;
      }
      payload.textoCifrado = await cifrarConClave(
        JSON.stringify({ titulo: titulo.trim(), texto: texto.trim() })
      );
      payload.texto = null;
      payload.titulo = null;
    } else {
      payload.texto = texto.trim();
      payload.titulo = titulo.trim() || null;
      payload.textoCifrado = null;
    }

    guardarEntradaDelDia(fecha, payload);
    onSaved?.();
    onClose();
  };

  const handleEliminar = () => {
    if (!window.confirm("¿Eliminar esta entrada para siempre? No se puede deshacer.")) return;
    eliminarEntrada(fecha);
    onSaved?.();
    onClose();
  };

  if (bloqueado) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 text-center">
          <p className="text-3xl mb-3">🔒</p>
          <p className="text-sm text-gray-700 mb-4">
            Esta entrada es privada. Ingresá tu PIN para verla o editarla.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={() => setMostrarDesbloqueo("desbloquear")}
              className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
            >
              Ingresar PIN
            </button>
          </div>
        </div>

        {mostrarDesbloqueo && (
          <DesbloqueoDiarioModal
            modo={mostrarDesbloqueo}
            onClose={() => setMostrarDesbloqueo(null)}
            onSuccess={async () => {
              setMostrarDesbloqueo(null);
              setBloqueado(false);
              setCargando(true);
              const plano = await descifrarConClave(existente.textoCifrado);
              const { titulo: t, texto: x } = parseContenidoCifrado(plano);
              setTitulo(t);
              setTexto(x);
              setCargando(false);
            }}
          />
        )}
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 text-center text-sm text-gray-400">
          Desbloqueando...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-900">Tu página de hoy</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500 capitalize">{formatFechaLarga(fecha)}</p>
          <button
            type="button"
            onClick={() => setDestacado((v) => !v)}
            className={`text-lg ${destacado ? "text-amber-400" : "text-gray-300 hover:text-amber-300"}`}
            aria-label="Marcar como destacada"
            title="Marcar como destacada"
          >
            {destacado ? "★" : "☆"}
          </button>
        </div>

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título (opcional)"
          className="w-full border border-rose-100 rounded-xl p-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-rose-300 mb-3"
        />

        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={toggleConsigna}
            className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
              mostrarConsigna
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300"
            }`}
          >
            💭 {mostrarConsigna ? "Usando una consigna" : "Usar una consigna"}
          </button>
        </div>

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

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí lo que quieras, sin filtro y sin juicio. Esto es solo para vos..."
          className="w-full border border-rose-100 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:border-rose-300 resize-none mb-3"
          rows={9}
          autoFocus
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

        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={() => setOculto((v) => !v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
              oculto
                ? "bg-gray-700 text-white border-gray-700"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
            title="La entrada aparece difuminada en la lista hasta que toques el ojo para verla"
          >
            {oculto ? "🙈 Oculta por defecto" : "🙈 Ocultar por defecto"}
          </button>

          <button
            type="button"
            onClick={handleTogglePrivada}
            className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
              privada
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400"
            }`}
            title="El título y el texto se cifran con tu PIN"
          >
            {privada ? "🔒 Es privada" : "🔒 Hacerla privada"}
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">🔒 Privado, solo vos podés verlo</p>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={!texto.trim() && archivos.length === 0}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>

        {existente && (
          <button
            type="button"
            onClick={handleEliminar}
            className="text-xs text-red-400 hover:text-red-600 hover:underline"
          >
            🗑 Eliminar esta entrada
          </button>
        )}
      </div>

      {mostrarDesbloqueo && (
        <DesbloqueoDiarioModal
          modo={mostrarDesbloqueo}
          onClose={() => setMostrarDesbloqueo(null)}
          onSuccess={() => {
            setPrivada(true);
            setMostrarDesbloqueo(null);
          }}
        />
      )}
    </div>
  );
}
