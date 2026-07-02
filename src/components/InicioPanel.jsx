import { useEffect, useMemo, useState } from "react";
import CircularProgress from "./CircularProgress";
import { getWeekData, totalWeeks } from "../data/seguimientoSemanal";
import { loadPerfil } from "../data/perfil";
import { loadCitas, toISODate as toISODateCita } from "../data/citas";
import { loadEntradas } from "../data/diarioLibre";

const tipoCitaIconos = {
  "Control obstétrico": "🩺",
  "Ecografía": "🖼️",
  "Análisis de sangre": "🩸",
  "Curso de preparto": "🎒",
  "Odontología": "🦷",
  "Nutrición": "🥗",
  "Psicología perinatal": "💬",
  "Otro": "🗓️",
};

const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

function formatFechaLarga(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

function getWeekDates(refDate) {
  const day = refDate.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function InicioPanel({ nombre, onNavigate }) {
  const today = useMemo(() => new Date(), []);
  const todayISO = toISODateCita(today);

  const [refDate, setRefDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const diasSemana = useMemo(() => getWeekDates(refDate), [refDate]);

  const [semanaActual, setSemanaActual] = useState(24);
  const [citas, setCitas] = useState([]);
  const [entradasDiario, setEntradasDiario] = useState([]);

  useEffect(() => {
    setSemanaActual(loadPerfil().semanaActual);
    setCitas(loadCitas());
    setEntradasDiario(loadEntradas());
  }, []);

  const data = useMemo(() => getWeekData(semanaActual), [semanaActual]);
  const porcentaje = Math.round((semanaActual / totalWeeks) * 100);

  const proximaCita = useMemo(() => {
    return [...citas]
      .filter((c) => c.fecha >= todayISO)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))[0];
  }, [citas, todayISO]);

  const cambiarSemana = (delta) => {
    setRefDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return next;
    });
  };

  const esHoy = selectedDate === todayISO;
  const esFuturo = selectedDate > todayISO;

  const citasDelDia = citas.filter((c) => c.fecha === selectedDate);
  const entradasDelDia = entradasDiario.filter((e) => e.fecha === selectedDate);

  const itemsRegistrados = useMemo(() => {
    const deCitas = citasDelDia.map((c) => ({
      id: `cita-${c.id}`,
      hora: c.hora || "",
      icon: tipoCitaIconos[c.tipo] || "🗓️",
      title: c.tipo,
      subtitle: [c.hora, c.lugar].filter(Boolean).join(" · ") || "Sin hora ni lugar",
      onClick: () => onNavigate?.("embarazo", "citas"),
    }));
    const deDiario = entradasDelDia.map((e) => ({
      id: `diario-${e.id}`,
      hora: e.hora || "",
      icon: "💭",
      title: e.prompt ? "Entrada de diario" : "Escribiste en tu diario",
      subtitle: e.texto ? e.texto.slice(0, 60) + (e.texto.length > 60 ? "…" : "") : e.prompt || "",
      onClick: () => onNavigate?.("bienestar"),
    }));
    return [...deCitas, ...deDiario].sort((a, b) => a.hora.localeCompare(b.hora));
  }, [citasDelDia, entradasDelDia, onNavigate]);

  const sugerencias = useMemo(() => {
    if (!esHoy) return [];
    const items = [];
    if (entradasDelDia.length === 0) {
      items.push({
        id: "sugerido-diario",
        icon: "💭",
        title: "Escribí en tu diario",
        subtitle: "Todavía no registraste cómo te sentiste hoy",
        onClick: () => onNavigate?.("bienestar"),
      });
    }
    items.push({
      id: "sugerido-contenido",
      icon: "🎧",
      title: "Tu contenido de hoy",
      subtitle: `Podcast y tips pensados para tu semana ${semanaActual}`,
      onClick: () => onNavigate?.("multimedia"),
    });
    return items;
  }, [esHoy, entradasDelDia, onNavigate, semanaActual]);

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Hola, {nombre || "mamá"} 👋</h2>
        <button className="w-9 h-9 rounded-full bg-white border border-rose-100 flex items-center justify-center text-gray-400 hover:text-rose-500">
          🔔
        </button>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-2 capitalize">
        {diasSemana[0].toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
      </p>

      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => cambiarSemana(-1)} className="text-gray-400 hover:text-rose-500 px-1">
          ←
        </button>
        <div className="grid grid-cols-7 gap-1 flex-1">
          {diasSemana.map((d, i) => {
            const iso = toISODateCita(d);
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDate;
            const tieneAlgo =
              citas.some((c) => c.fecha === iso) || entradasDiario.some((e) => e.fecha === iso);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(iso)}
                className={`relative rounded-xl py-2 flex flex-col items-center transition-colors ${
                  isSelected
                    ? "bg-rose-500 text-white"
                    : isToday
                    ? "bg-rose-100 text-rose-600 font-semibold"
                    : "bg-white border border-rose-100 text-gray-600 hover:bg-rose-50"
                }`}
              >
                <span className="text-[10px] uppercase opacity-80">{weekdayLabels[i]}</span>
                <span className="text-sm font-medium">{d.getDate()}</span>
                {tieneAlgo && (
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
        <button onClick={() => cambiarSemana(1)} className="text-gray-400 hover:text-rose-500 px-1">
          →
        </button>
      </div>

      {/* Tarjeta de embarazo: lo más importante, justo debajo de los días */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-400 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center mb-6">
          <CircularProgress value={porcentaje} size={130} stroke={9}>
            <span className="text-xl font-semibold">Semana {semanaActual}</span>
            <span className="text-xs opacity-90">{porcentaje}% del camino</span>
          </CircularProgress>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl shrink-0">
              {data.size.emoji}
            </div>
            <div>
              <p className="text-white text-sm opacity-90">Tu bebé es del tamaño de</p>
              <p className="text-white text-lg font-semibold">{data.size.name}</p>
              <p className="text-white text-sm opacity-90 mt-1">
                {data.weight ? `≈ ${data.weight} g` : "—"}
                {data.length ? ` · ≈ ${data.length} cm` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/15 rounded-2xl p-4 mb-5">
          <p className="text-xs text-white opacity-80 mb-1">Hito de esta semana</p>
          <p className="text-sm text-white">{data.milestone}</p>
        </div>

        <button
          onClick={() => onNavigate?.("embarazo", "seguimiento")}
          className="bg-white text-rose-600 text-sm font-medium px-5 py-2 rounded-xl hover:bg-rose-50 transition-colors"
        >
          Ver semana completa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Columna principal: agenda */}
        <div>
          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 capitalize mb-4">
              {esHoy ? "Hoy" : formatFechaLarga(selectedDate)}
            </p>

            {itemsRegistrados.length === 0 && sugerencias.length === 0 && (
              <p className="text-sm text-gray-400">
                {esFuturo ? "Todavía no tenés nada agendado este día." : "No registraste nada este día."}
              </p>
            )}

            {itemsRegistrados.length > 0 && (
              <ul className="space-y-2 mb-4">
                {itemsRegistrados.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 text-left bg-rose-50 border border-rose-100 rounded-xl p-3 hover:border-rose-300 transition-colors"
                    >
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                      </div>
                      {item.hora && (
                        <span className="text-xs text-gray-400 shrink-0">{item.hora}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {sugerencias.length > 0 && (
              <>
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-2">
                  Sugerencias para hoy
                </p>
                <ul className="space-y-2">
                  {sugerencias.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={item.onClick}
                        className="w-full flex items-center gap-3 text-left bg-white border border-dashed border-rose-200 rounded-xl p-3 hover:border-rose-400 transition-colors"
                      >
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                        </div>
                        <span className="text-rose-400 text-sm">＋</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Columna lateral: próxima cita y alertas */}
        <div className="space-y-4">
          <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Próxima cita
            </p>
            {proximaCita ? (
              <button
                onClick={() => onNavigate?.("embarazo", "citas")}
                className="w-full text-left bg-rose-50 border border-rose-100 rounded-xl p-3 hover:border-rose-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tipoCitaIconos[proximaCita.tipo] || "🗓️"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{proximaCita.tipo}</p>
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {formatFechaLarga(proximaCita.fecha)}
                      {proximaCita.hora && ` · ${proximaCita.hora}`}
                    </p>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onNavigate?.("embarazo", "citas")}
                className="w-full text-left bg-rose-50 border border-rose-100 rounded-xl p-3 hover:border-rose-300 transition-colors"
              >
                <p className="text-sm text-gray-700">No tenés citas agendadas</p>
                <p className="text-xs text-rose-500 mt-1">+ Agendar una cita</p>
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm">
            ⚠️ Sin alertas médicas activas. Todo en orden esta semana.
          </div>
        </div>
      </div>
    </div>
  );
}
