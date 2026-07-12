import { useEffect, useMemo, useRef, useState } from "react";
import EscribirEntradaModal from "./EscribirEntradaModal";
import CalendarioMensual from "./CalendarioMensual";
import DesbloqueoDiarioModal from "./DesbloqueoDiarioModal";
import EyeIcon from "./EyeIcon";
import { toISODate } from "../data/diarioLibre";
import { loadEntradas, toggleDestacado, eliminarEntrada } from "../data/diario";
import { loadPerfil } from "../data/perfil";
import { semanaEnFecha, trimesterOf } from "../data/seguimientoSemanal";
import { diarioDesbloqueado, descifrarConClave, bloquearDiario } from "../data/diarioSeguridad";

const trimestreLabel = { 1: "1er trimestre", 2: "2do trimestre", 3: "3er trimestre" };

function formatFechaLarga(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

function mesLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  const texto = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function normalizar(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function fechaTextos(fechaISO) {
  const d = new Date(fechaISO + "T00:00:00");
  return [
    fechaISO,
    d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    d.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
    d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }),
  ].map(normalizar);
}

function trimestreDeQuery(qNorm) {
  if (!qNorm.includes("trimestre")) return null;
  if (/\b(1er|1ro|1|primer)\b/.test(qNorm)) return 1;
  if (/\b(2do|2ro|2|segundo)\b/.test(qNorm)) return 2;
  if (/\b(3er|3ro|3|tercer)\b/.test(qNorm)) return 3;
  return null;
}

function entradaCoincide(e, contenido, qNorm, trimestreQuery, semana) {
  if (!qNorm) return true;
  if (normalizar(contenido.titulo).includes(qNorm)) return true;
  if (normalizar(contenido.texto).includes(qNorm)) return true;
  if (normalizar(e.prompt).includes(qNorm)) return true;
  if (fechaTextos(e.fecha).some((t) => t.includes(qNorm))) return true;
  if (trimestreQuery && trimesterOf(semana) === trimestreQuery) return true;
  return false;
}

function parseContenidoCifrado(plano) {
  try {
    const obj = JSON.parse(plano);
    return { titulo: obj.titulo || "", texto: obj.texto || "" };
  } catch {
    return { titulo: "", texto: plano };
  }
}

export default function DiarioLibre() {
  const today = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => toISODate(today), [today]);
  const [entradas, setEntradas] = useState({});
  const [modalFecha, setModalFecha] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [soloFavoritas, setSoloFavoritas] = useState(false);
  const [semanaActual, setSemanaActual] = useState(24);
  const [selectedFecha, setSelectedFecha] = useState(null);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(today);
  const [desbloqueado, setDesbloqueado] = useState(diarioDesbloqueado());
  const [descifradas, setDescifradas] = useState({});
  const [revelado, setRevelado] = useState(() => new Set());
  const [mostrarDesbloqueo, setMostrarDesbloqueo] = useState(false);
  const cardRefs = useRef({});

  useEffect(() => {
    setEntradas(loadEntradas());
    loadPerfil().then((p) => setSemanaActual(p.semanaActual));
  }, []);

  useEffect(() => {
    if (!desbloqueado) return;
    const privadas = Object.values(entradas).filter((e) => e.privada && e.textoCifrado);
    if (privadas.length === 0) return;
    Promise.all(
      privadas.map(async (e) => {
        const plano = await descifrarConClave(e.textoCifrado);
        return [e.fecha, parseContenidoCifrado(plano)];
      })
    ).then((pares) => {
      setDescifradas((prev) => ({ ...prev, ...Object.fromEntries(pares) }));
    });
  }, [desbloqueado, entradas]);

  useEffect(() => {
    if (selectedFecha && cardRefs.current[selectedFecha]) {
      cardRefs.current[selectedFecha].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedFecha]);

  const entradaHoy = entradas[todayISO] || null;

  const semanaPorFecha = useMemo(() => {
    const mapa = new Map();
    Object.keys(entradas).forEach((fecha) => {
      mapa.set(fecha, semanaEnFecha(fecha, semanaActual, today));
    });
    return mapa;
  }, [entradas, semanaActual, today]);

  const contenidoVisible = (e) => {
    if (e.privada) {
      if (!desbloqueado) return { titulo: null, texto: null };
      return descifradas[e.fecha] || { titulo: null, texto: "" };
    }
    return { titulo: e.titulo || null, texto: e.texto };
  };

  const listaFiltrada = useMemo(() => {
    const qNorm = normalizar(busqueda);
    const trimestreQuery = trimestreDeQuery(qNorm);
    return Object.values(entradas)
      .filter((e) => !soloFavoritas || e.destacado)
      .filter((e) =>
        entradaCoincide(e, contenidoVisible(e), qNorm, trimestreQuery, semanaPorFecha.get(e.fecha))
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entradas, busqueda, soloFavoritas, semanaPorFecha, desbloqueado, descifradas]);

  const grupos = useMemo(() => {
    const porMes = new Map();
    listaFiltrada.forEach((e) => {
      const mesKey = e.fecha.slice(0, 7);
      if (!porMes.has(mesKey)) porMes.set(mesKey, []);
      porMes.get(mesKey).push(e);
    });
    return Array.from(porMes.entries());
  }, [listaFiltrada]);

  const totalEntradas = Object.keys(entradas).length;

  const handleToggleDestacado = (fecha) => {
    setEntradas(toggleDestacado(fecha));
  };

  const handleEliminar = (fecha) => {
    if (!window.confirm("¿Eliminar esta entrada para siempre? No se puede deshacer.")) return;
    setEntradas(eliminarEntrada(fecha));
    if (selectedFecha === fecha) setSelectedFecha(null);
  };

  const toggleRevelado = (fecha) => {
    setRevelado((prev) => {
      const next = new Set(prev);
      if (next.has(fecha)) next.delete(fecha);
      else next.add(fecha);
      return next;
    });
  };

  const handleClickCard = (fecha) => {
    setSelectedFecha((prev) => (prev === fecha ? null : fecha));
  };

  const handleSeleccionarFechaCalendario = (fechaISO) => {
    setBusqueda("");
    setSoloFavoritas(false);
    setCalendarioAbierto(false);
    if (entradas[fechaISO]) {
      setSelectedFecha(fechaISO);
    } else {
      setModalFecha(fechaISO);
    }
  };

  const handleSeleccionarMesCalendario = (mesDate) => {
    setSoloFavoritas(false);
    setSelectedFecha(null);
    setBusqueda(mesLabel(toISODate(mesDate)));
    setCalendarioAbierto(false);
  };

  const handleCambiarMesCalendario = (delta) => {
    const nuevoMes = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + delta, 1);
    setMesCalendario(nuevoMes);
    setSoloFavoritas(false);
    setSelectedFecha(null);
    setBusqueda(mesLabel(toISODate(nuevoMes)));
  };

  const handleBloquear = () => {
    bloquearDiario();
    setDesbloqueado(false);
    setDescifradas({});
  };

  return (
    <div>
      <button
        onClick={() => setModalFecha(todayISO)}
        className="w-full text-left bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl p-5 shadow-sm mb-6 hover:opacity-95 transition-opacity"
      >
        <p className="text-white text-sm opacity-90 mb-1">
          {entradaHoy ? "Ya escribiste hoy" : "¿Qué tenés ganas de contar hoy?"}
        </p>
        <p className="text-white font-semibold">
          {entradaHoy ? "✏️ Seguir escribiendo la entrada de hoy" : "+ Escribir en tu diario"}
        </p>
      </button>

      {totalEntradas > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por texto, fecha o trimestre..."
            className="flex-1 min-w-[180px] border border-rose-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300 bg-white"
          />
          <div className="relative">
            <button
              onClick={() => setCalendarioAbierto((v) => !v)}
              className={`text-sm px-3 py-2 rounded-xl border whitespace-nowrap transition-colors ${
                calendarioAbierto
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
              }`}
            >
              📅 Calendario
            </button>
            {calendarioAbierto && (
              <div className="absolute right-0 mt-2 z-20">
                <CalendarioMensual
                  mes={mesCalendario}
                  fechasConEntrada={new Set(Object.keys(entradas))}
                  seleccionada={selectedFecha}
                  onCambiarMes={handleCambiarMesCalendario}
                  onSelect={handleSeleccionarFechaCalendario}
                  onSelectMes={handleSeleccionarMesCalendario}
                />
              </div>
            )}
          </div>
          <button
            onClick={() => setSoloFavoritas((v) => !v)}
            className={`text-sm px-3 py-2 rounded-xl border whitespace-nowrap transition-colors ${
              soloFavoritas
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
            }`}
          >
            {soloFavoritas ? "★ Solo destacadas" : "☆ Solo destacadas"}
          </button>
          {desbloqueado && (
            <button
              onClick={handleBloquear}
              className="text-sm px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 whitespace-nowrap hover:border-amber-400 transition-colors"
              title="Volver a ocultar el contenido de tus entradas privadas"
            >
              🔓 Bloquear privadas
            </button>
          )}
        </div>
      )}

      {selectedFecha && (
        <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 mb-4">
          <p className="text-xs text-rose-600 font-medium capitalize truncate">
            📍 {formatFechaLarga(selectedFecha)}
          </p>
          <button
            onClick={() => setSelectedFecha(null)}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {totalEntradas === 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 shadow-sm text-center">
          <p className="text-3xl mb-3">💜</p>
          <p className="text-sm text-gray-500">
            Todavía no escribiste ninguna entrada. Este es tu espacio, sin filtro y sin juicio.
          </p>
        </div>
      )}

      {totalEntradas > 0 && grupos.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No encontramos entradas con eso.</p>
      )}

      <div className="space-y-8">
        {grupos.map(([mesKey, entradasDelMes]) => (
          <div key={mesKey}>
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-3">
              {mesLabel(entradasDelMes[0].fecha)} · {entradasDelMes.length}{" "}
              {entradasDelMes.length === 1 ? "entrada" : "entradas"}
            </p>
            <div className="space-y-4">
              {entradasDelMes.map((e) => {
                const bloqueada = e.privada && !desbloqueado;
                const revelada = revelado.has(e.fecha);
                const oculta = e.oculto && !revelada && !bloqueada;
                const contenido = contenidoVisible(e);

                return (
                  <div
                    key={e.fecha}
                    ref={(el) => (cardRefs.current[e.fecha] = el)}
                    onClick={() => handleClickCard(e.fecha)}
                    className={`bg-white rounded-2xl border border-rose-100 p-5 shadow-sm cursor-pointer transition-opacity duration-300 ${
                      selectedFecha && selectedFecha !== e.fecha ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        {contenido.titulo && (
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {contenido.titulo}
                          </p>
                        )}
                        <p
                          className={`capitalize ${
                            contenido.titulo
                              ? "text-xs text-gray-400 mt-0.5"
                              : "text-sm font-semibold text-gray-800"
                          }`}
                        >
                          {formatFechaLarga(e.fecha)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Semana {semanaPorFecha.get(e.fecha)} ·{" "}
                          {trimestreLabel[trimesterOf(semanaPorFecha.get(e.fecha))]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0" onClick={(ev) => ev.stopPropagation()}>
                        {e.privada && <span title="Entrada privada">🔒</span>}
                        {e.oculto && !bloqueada && (
                          <button
                            onClick={() => toggleRevelado(e.fecha)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={revelada ? "Ocultar entrada" : "Mostrar entrada"}
                            title={revelada ? "Ocultar entrada" : "Mostrar entrada"}
                          >
                            <EyeIcon off={revelada} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleDestacado(e.fecha)}
                          className={`text-lg leading-none ${
                            e.destacado ? "text-amber-400" : "text-gray-300 hover:text-amber-300"
                          }`}
                          aria-label="Marcar como destacada"
                          title="Marcar como destacada"
                        >
                          {e.destacado ? "★" : "☆"}
                        </button>
                        <button
                          onClick={() => handleEliminar(e.fecha)}
                          className="text-gray-300 hover:text-red-500 text-sm"
                          aria-label="Eliminar entrada"
                          title="Eliminar entrada"
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    {bloqueada ? (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setMostrarDesbloqueo(true);
                        }}
                        className="w-full text-left bg-gray-50 border border-dashed border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 hover:border-gray-400 transition-colors"
                      >
                        🔒 Entrada privada — tocá para desbloquear
                      </button>
                    ) : oculta ? (
                      <p className="text-sm text-gray-400 italic">🙈 Contenido oculto</p>
                    ) : (
                      <>
                        {e.prompt && <p className="text-sm text-rose-500 italic mb-2">"{e.prompt}"</p>}
                        {contenido.texto && (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{contenido.texto}</p>
                        )}

                        {e.archivos?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
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
                      </>
                    )}

                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setModalFecha(e.fecha);
                      }}
                      className="text-sm text-rose-500 hover:text-rose-600 font-medium mt-1"
                    >
                      Editar entrada
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {modalFecha && (
        <EscribirEntradaModal
          fecha={modalFecha}
          onClose={() => setModalFecha(null)}
          onSaved={() => {
            setEntradas(loadEntradas());
            setDesbloqueado(diarioDesbloqueado());
          }}
        />
      )}

      {mostrarDesbloqueo && (
        <DesbloqueoDiarioModal
          modo="desbloquear"
          onClose={() => setMostrarDesbloqueo(false)}
          onSuccess={() => {
            setDesbloqueado(true);
            setMostrarDesbloqueo(false);
          }}
        />
      )}
    </div>
  );
}
