import { useEffect, useRef, useState } from "react";
import {
  getMiId,
  loadMensajes,
  enviarMensaje,
  suscribirseAMensajes,
  resolverNombreMostrado,
  reportar,
} from "../data/comunidad";

export default function GruposChat({ grupo, nombre }) {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [miId, setMiId] = useState(null);
  const listaRef = useRef(null);

  useEffect(() => {
    if (!grupo) return;
    let activo = true;
    setCargando(true);
    getMiId().then((id) => activo && setMiId(id));
    loadMensajes(grupo.id).then((data) => {
      if (!activo) return;
      setMensajes(data);
      setCargando(false);
    });
    const unsub = suscribirseAMensajes(grupo.id, async (nuevo) => {
      const nombreMostrado = await resolverNombreMostrado(grupo.id, nuevo.user_id, nuevo.es_anonimo);
      if (activo) setMensajes((prev) => [...prev, { ...nuevo, nombreMostrado }]);
    });
    return () => {
      activo = false;
      unsub();
    };
  }, [grupo]);

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || !grupo) return;
    const contenido = texto;
    setTexto("");
    await enviarMensaje(grupo.id, contenido, anonimo);
  };

  const handleReportar = async (mensajeId) => {
    const motivo = window.prompt("¿Por qué querés reportar este mensaje? (opcional)");
    if (motivo === null) return;
    await reportar("mensaje", mensajeId, motivo);
    window.alert("Gracias, lo vamos a revisar.");
  };

  if (!grupo) {
    return (
      <div className="bg-white rounded-2xl border border-rose-100 p-8 shadow-sm text-center">
        <p className="text-sm text-gray-500">
          No pudimos asignarte a un grupo todavía. Completá tu semana de embarazo en Mi Perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm flex flex-col h-[560px]">
      <div className="px-5 py-3 border-b border-rose-100">
        <p className="text-sm font-semibold text-gray-800">{grupo.nombre}</p>
        <p className="text-xs text-gray-400">Tu grupo de comunidad</p>
      </div>

      <div ref={listaRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {cargando ? (
          <p className="text-sm text-gray-400 text-center py-8">Cargando mensajes...</p>
        ) : mensajes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Todavía no hay mensajes. ¡Sé la primera en saludar! 👋
          </p>
        ) : (
          mensajes.map((m) => {
            const esMio = m.user_id === miId;
            return (
              <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] group relative rounded-2xl px-4 py-2.5 ${
                    esMio ? "bg-rose-500 text-white" : "bg-rose-50 text-gray-700"
                  }`}
                >
                  {!esMio && <p className="text-xs font-semibold text-rose-500 mb-0.5">{m.nombreMostrado}</p>}
                  <p className="text-sm whitespace-pre-wrap">{m.contenido}</p>
                  {!esMio && (
                    <button
                      onClick={() => handleReportar(m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 hover:text-red-500 mt-1"
                    >
                      Reportar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleEnviar} className="border-t border-rose-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setAnonimo((v) => !v)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              anonimo
                ? "bg-gray-800 border-gray-800 text-white"
                : "bg-white border-rose-100 text-gray-500 hover:border-rose-300"
            }`}
          >
            {anonimo ? "🕶️ Enviando como anónima" : `Enviando como ${nombre || "vos"}`}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí un mensaje..."
            className="flex-1 border border-rose-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
          />
          <button
            type="submit"
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
