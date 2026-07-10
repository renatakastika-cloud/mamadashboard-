import { useEffect, useMemo, useState } from "react";
import RegistroDiarioModal from "./RegistroDiarioModal";
import {
  toISODate,
  weekdayLabels,
  weekdayLabelsLargo,
  getWeekDates,
  formatRangoSemana,
} from "../data/diarioLibre";
import { loadRegistros, animoOpciones } from "../data/registroDiario";
import { loadPerfil } from "../data/perfil";
import { getWeekData } from "../data/seguimientoSemanal";

export default function DiarioLibre() {
  const today = useMemo(() => new Date(), []);
  const [refDate, setRefDate] = useState(today);
  const [selected, setSelected] = useState(toISODate(today));
  const [registros, setRegistros] = useState({});
  const [semanaActual, setSemanaActual] = useState(24);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    setRegistros(loadRegistros());
    loadPerfil().then((p) => setSemanaActual(p.semanaActual));
  }, []);

  const diasSemana = useMemo(() => getWeekDates(refDate), [refDate]);
  const todayISO = toISODate(today);
  const registroDelDia = registros[selected] || null;
  const animoInfo = animoOpciones.find((o) => o.value === registroDelDia?.animo);

  const cambiarSemana = (delta) => {
    const next = new Date(refDate);
    next.setDate(refDate.getDate() + delta * 7);
    setRefDate(next);
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
            const tieneRegistro = Boolean(registros[iso]);
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
                {tieneRegistro && (
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
        {weekdayLabelsLargo[(new Date(selected + "T00:00:00").getDay() + 6) % 7]}{" "}
        {new Date(selected + "T00:00:00").getDate()}
      </p>

      {registroDelDia ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Estado de ánimo</p>
              <p className="text-2xl">{animoInfo?.emoji || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Energía</p>
              <p className="text-sm font-medium text-gray-800">
                {registroDelDia.energia ? `${registroDelDia.energia} / 5` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Sueño</p>
              <p className="text-sm font-medium text-gray-800">
                {registroDelDia.sueno ? `${registroDelDia.sueno} / 5` : "—"}
              </p>
            </div>
          </div>

          {registroDelDia.sintomas?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Síntomas</p>
              <div className="flex flex-wrap gap-2">
                {registroDelDia.sintomas.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-rose-50 border border-rose-100 text-gray-700 rounded-full px-3 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {registroDelDia.prompt && (
            <p className="text-sm text-rose-500 italic mb-2">"{registroDelDia.prompt}"</p>
          )}
          {registroDelDia.nota && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{registroDelDia.nota}</p>
          )}

          {registroDelDia.archivos?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {registroDelDia.archivos.map((a) =>
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

          <button
            onClick={() => setModalAbierto(true)}
            className="text-sm text-rose-500 hover:text-rose-600 font-medium"
          >
            Editar registro
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm text-center">
          <p className="text-sm text-gray-400 mb-4">Todavía no completaste el registro de este día.</p>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Completar registro
          </button>
        </div>
      )}

      {modalAbierto && (
        <RegistroDiarioModal
          fecha={selected}
          sintomasSemana={getWeekData(semanaActual).symptoms}
          onClose={() => setModalAbierto(false)}
          onSaved={() => setRegistros(loadRegistros())}
        />
      )}
    </div>
  );
}
