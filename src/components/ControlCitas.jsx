import { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import {
  loadCitas,
  saveCitas,
  tiposCita,
  toISODate,
  getMonthGrid,
  weekdayLabels,
  monthLabels,
} from "../data/citas";

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
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [citas, setCitas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(toISODate(today));
  const [form, setForm] = useState({ ...emptyForm, fecha: toISODate(today) });
  const [editingId, setEditingId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setCitas(loadCitas());
  }, []);

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

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
      >
        ← Volver a Mi Embarazo
      </button>

      <div className="flex items-start justify-between">
        <Header
          title="🗓️ Control de citas"
          subtitle="Agenda, recordatorios y preguntas para el médico — todo en un calendario"
        />
        <button
          onClick={() => abrirFormNuevo()}
          className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors whitespace-nowrap"
        >
          + Agregar cita
        </button>
      </div>

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

      {showForm && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl border border-rose-100 p-6 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800">
                {editingId ? "Editar cita" : "Agregar nueva cita"}
              </p>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-rose-500 text-lg leading-none"
              >
                ×
              </button>
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

            <label className="text-xs text-gray-500 block mb-1">Preguntas para el médico</label>
            <textarea
              value={form.preguntas}
              onChange={(e) => updateField("preguntas", e.target.value)}
              placeholder="Ej: ¿es normal sentir...?"
              className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:border-rose-300 resize-none"
              rows={2}
            />

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
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-rose-500"
              >
                Cancelar
              </button>
              {saved && <span className="text-sm text-green-600">Guardado ✓</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
