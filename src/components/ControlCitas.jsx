import { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import FeatureCard from "./FeatureCard";
import GuiaExamenes from "./GuiaExamenes";
import {
  loadCitas,
  saveCitas,
  tiposCita,
  toISODate,
  getMonthGrid,
  weekdayLabels,
  monthLabels,
  buildGoogleCalendarUrl,
} from "../data/citas";
import {
  preguntasSugeridas,
  loadPrimeraConsulta,
  savePrimeraConsulta,
} from "../data/primeraConsultaPostparto";
import {
  getGoogleCalendarStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  getGoogleCalendarEvents,
} from "../data/googleCalendar";

const TIPO_PRIMERA_CONSULTA_POSTPARTO = "Primera consulta postparto";

const emptyForm = {
  fecha: "",
  hora: "",
  tipo: tiposCita[0],
  medico: "",
  lugar: "",
  preguntas: "",
  notas: "",
  compartirPartner: false,
};

export default function ControlCitas({ onBack }) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState("list");
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [citas, setCitas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(toISODate(today));
  const [form, setForm] = useState({ ...emptyForm, fecha: toISODate(today) });
  const [editingId, setEditingId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [marcadas, setMarcadas] = useState([]);
  const [propias, setPropias] = useState([]);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [googleMsg, setGoogleMsg] = useState(null);

  useEffect(() => {
    setCitas(loadCitas());
    const data = loadPrimeraConsulta();
    setMarcadas(data.marcadas);
    setPropias(data.propias);

    const params = new URLSearchParams(window.location.search);
    const googleParam = params.get("google_calendar");
    if (googleParam) {
      setGoogleMsg(googleParam === "connected" ? "success" : "error");
      params.delete("google_calendar");
      const query = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (query ? `?${query}` : ""));
    }

    getGoogleCalendarStatus()
      .then((s) => setGoogleConnected(s.connected))
      .finally(() => setGoogleLoading(false));
  }, []);

  useEffect(() => {
    if (!googleConnected) {
      setGoogleEvents([]);
      return;
    }
    getGoogleCalendarEvents(selectedDate).then((r) => setGoogleEvents(r.events || []));
  }, [googleConnected, selectedDate]);

  const handleConectarGoogle = () => {
    connectGoogleCalendar();
  };

  const handleDesconectarGoogle = async () => {
    await disconnectGoogleCalendar();
    setGoogleConnected(false);
    setGoogleEvents([]);
  };

  useEffect(() => {
    savePrimeraConsulta({ marcadas, propias });
  }, [marcadas, propias]);

  const togglePregunta = (item) => {
    setMarcadas((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const agregarPreguntaPropia = () => {
    const texto = nuevaPregunta.trim();
    if (!texto) return;
    setPropias((prev) => [...prev, { id: Date.now().toString(), texto }]);
    setNuevaPregunta("");
  };

  const eliminarPreguntaPropia = (id) => {
    setPropias((prev) => prev.filter((p) => p.id !== id));
    setMarcadas((prev) => prev.filter((x) => x !== id));
  };

  const grid = useMemo(() => getMonthGrid(cursor.year, cursor.month), [cursor]);

  const citasPorFecha = useMemo(() => {
    const map = {};
    citas.forEach((c) => {
      map[c.fecha] = map[c.fecha] || [];
      map[c.fecha].push(c);
    });
    return map;
  }, [citas]);

  const proximas = useMemo(() => {
    const todayISO = toISODate(today);
    return [...citas]
      .filter((c) => c.fecha >= todayISO)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }, [citas, today]);

  const abrirFormNuevo = (fecha) => {
    setEditingId(null);
    setForm({ ...emptyForm, fecha: fecha || selectedDate });
    setSaved(false);
    setShowForm(true);
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const iso = toISODate(date);
    setSelectedDate(iso);
    abrirFormNuevo(iso);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleGuardar = () => {
    if (!form.fecha || !form.tipo) return;
    let next;
    if (editingId) {
      next = citas.map((c) => (c.id === editingId ? { ...form, id: editingId } : c));
    } else {
      next = [...citas, { ...form, id: Date.now().toString() }];
    }
    setCitas(next);
    saveCitas(next);
    setSaved(true);
    setSelectedDate(form.fecha);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditar = (cita) => {
    setForm({ ...cita });
    setEditingId(cita.id);
    setSelectedDate(cita.fecha);
    setSaved(false);
    setShowForm(true);
  };

  const handleEliminar = (id) => {
    const next = citas.filter((c) => c.id !== id);
    setCitas(next);
    saveCitas(next);
    if (editingId === id) {
      setEditingId(null);
      setShowForm(false);
    }
  };

  const changeMonth = (delta) => {
    setCursor((prev) => {
      let month = prev.month + delta;
      let year = prev.year;
      if (month < 0) { month = 11; year -= 1; }
      if (month > 11) { month = 0; year += 1; }
      return { year, month };
    });
  };

  const todayISO = toISODate(today);

  const renderCitaForm = (isModal) => (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">
          {editingId ? "Editar cita" : "Agregar nueva cita"}
        </p>
        {isModal && (
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-rose-500 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => {
              updateField("fecha", e.target.value);
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Hora</label>
          <input
            type="time"
            value={form.hora}
            onChange={(e) => updateField("hora", e.target.value)}
            className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
          />
        </div>
      </div>

      <label className="text-xs text-gray-500 block mb-1">Tipo de cita</label>
      <select
        value={form.tipo}
        onChange={(e) => updateField("tipo", e.target.value)}
        className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:border-rose-300"
      >
        {tiposCita.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <label className="text-xs text-gray-500 block mb-1">Médico / profesional</label>
      <input
        type="text"
        value={form.medico}
        onChange={(e) => updateField("medico", e.target.value)}
        placeholder="Ej: Dra. Pérez"
        className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:border-rose-300"
      />

      <label className="text-xs text-gray-500 block mb-1">Lugar</label>
      <input
        type="text"
        value={form.lugar}
        onChange={(e) => updateField("lugar", e.target.value)}
        placeholder="Ej: Clínica del Sol, consultorio 4"
        className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:border-rose-300"
      />

      {form.tipo === TIPO_PRIMERA_CONSULTA_POSTPARTO ? (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">
            Preguntas sugeridas para tu primera consulta postparto
          </p>
          <ul className="space-y-2 mb-3">
            {preguntasSugeridas.map((p) => {
              const checked = marcadas.includes(p);
              return (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => togglePregunta(p)}
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
            {propias.map((p) => {
              const checked = marcadas.includes(p.id);
              return (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => togglePregunta(p.id)}
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
                    type="button"
                    onClick={() => eliminarPreguntaPropia(p.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaPregunta}
              onChange={(e) => setNuevaPregunta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarPreguntaPropia()}
              placeholder="Ej: ¿es normal esta molestia en...?"
              className="flex-1 border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
            />
            <button
              type="button"
              onClick={agregarPreguntaPropia}
              className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors whitespace-nowrap"
            >
              + Agregar
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className="text-xs text-gray-500 block mb-1">Preguntas para el médico</label>
          <textarea
            value={form.preguntas}
            onChange={(e) => updateField("preguntas", e.target.value)}
            placeholder="Ej: ¿es normal sentir...?"
            className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:border-rose-300 resize-none"
            rows={2}
          />
        </>
      )}

      <label className="text-xs text-gray-500 block mb-1">Notas adicionales</label>
      <textarea
        value={form.notas}
        onChange={(e) => updateField("notas", e.target.value)}
        placeholder="Ej: llevar estudios anteriores"
        className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-4 focus:outline-none focus:border-rose-300 resize-none"
        rows={2}
      />

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={form.compartirPartner}
          onChange={(e) => updateField("compartirPartner", e.target.checked)}
          className="accent-rose-500 w-4 h-4"
        />
        <span className="text-sm text-gray-700">Compartir esta cita con mi partner 👥</span>
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={handleGuardar}
          className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
        >
          {editingId ? "Guardar cambios" : "Agregar cita"}
        </button>
        <button
          onClick={() => (isModal ? setShowForm(false) : abrirFormNuevo())}
          className="text-sm text-gray-500 hover:text-rose-500"
        >
          {isModal ? "Cancelar" : "Limpiar"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-2">
            Guardado ✓
            <a
              href={buildGoogleCalendarUrl(form)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 hover:underline"
            >
              📅 Agregar a Google Calendar
            </a>
          </span>
        )}
      </div>
    </>
  );

  if (view === "examenes") {
    return (
      <GuiaExamenes
        onBack={() => {
          setCitas(loadCitas());
          setView("list");
        }}
      />
    );
  }

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
        >
          ← Volver
        </button>
      )}

      <div className="flex items-start justify-between mb-6">
        <Header
          title="🗓️ Control de citas"
          subtitle="Agenda, recordatorios y preguntas para el médico — todo en un calendario"
        />
        <button
          onClick={() => abrirFormNuevo()}
          className="lg:hidden bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors whitespace-nowrap"
        >
          + Agregar cita
        </button>
      </div>

      {googleMsg && (
        <div
          className={`mb-4 text-sm rounded-xl px-4 py-2 ${
            googleMsg === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {googleMsg === "success"
            ? "✓ Google Calendar conectado."
            : "No se pudo conectar tu Google Calendar. Intentá de nuevo."}
        </div>
      )}

      {!googleLoading && (
        <div className="flex items-center gap-3 mb-6 text-sm">
          {googleConnected ? (
            <>
              <span className="text-gray-600">📅 Google Calendar conectado</span>
              <button
                onClick={handleDesconectarGoogle}
                className="text-gray-400 hover:text-red-500 hover:underline"
              >
                Desconectar
              </button>
            </>
          ) : (
            <button
              onClick={handleConectarGoogle}
              className="text-rose-500 hover:underline"
            >
              📅 Conectar Google Calendar (para ver cuándo estás ocupada)
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
      <div>
      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="text-gray-400 hover:text-rose-500 px-2"
          >
            ←
          </button>
          <p className="text-sm font-medium text-gray-800">
            {monthLabels[cursor.month]} {cursor.year}
          </p>
          <button
            onClick={() => changeMonth(1)}
            className="text-gray-400 hover:text-rose-500 px-2"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
          {weekdayLabels.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((date, i) => {
            if (!date) return <div key={i} />;
            const iso = toISODate(date);
            const hasCita = citasPorFecha[iso]?.length > 0;
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDate;
            return (
              <button
                key={i}
                onClick={() => handleDayClick(date)}
                className={`relative aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-rose-500 text-white"
                    : isToday
                    ? "bg-rose-100 text-rose-600 font-semibold"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                {date.getDate()}
                {hasCita && !isSelected && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
                {hasCita && isSelected && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Tocá un día para agregar una cita en esa fecha.
        </p>

        {googleConnected && (
          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Tu Google Calendar el {selectedDate}
            </p>
            {googleEvents.length === 0 ? (
              <p className="text-xs text-gray-400">No estás ocupada ese día 🎉</p>
            ) : (
              <ul className="space-y-1">
                {googleEvents.map((ev) => (
                  <li key={ev.id} className="text-xs text-gray-600">
                    {ev.allDay
                      ? "Todo el día"
                      : new Date(ev.start).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                    · {ev.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-700 mb-2">Próximas citas</p>
          {proximas.length === 0 && (
            <p className="text-sm text-gray-400">No tenés citas agendadas todavía.</p>
          )}
          <ul className="space-y-2">
            {proximas.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {c.tipo} {c.compartirPartner && <span title="Compartida con partner">👥</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.fecha} {c.hora && `· ${c.hora}`} {c.lugar && `· ${c.lugar}`}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <a
                    href={buildGoogleCalendarUrl(c)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-500 hover:underline whitespace-nowrap"
                    title="Agregar a Google Calendar"
                  >
                    📅 Google
                  </a>
                  <button
                    onClick={() => handleEditar(c)}
                    className="text-rose-500 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(c.id)}
                    className="text-gray-400 hover:text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-xl mt-6">
        <FeatureCard
          icon="🧪"
          title="Guía de exámenes por semana"
          desc="Qué estudios suelen pedirse en cada trimestre"
          onClick={() => setView("examenes")}
        />
      </div>
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-rose-100 p-6 shadow-sm">
        {renderCitaForm(false)}
      </div>
      </div>

      {showForm && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl border border-rose-100 p-6 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {renderCitaForm(true)}
          </div>
        </div>
      )}
    </div>
  );
}
