import { useEffect, useMemo, useState } from "react";
import RegistroDiarioModal from "./RegistroDiarioModal";
import RecuperacionPostparto from "./RecuperacionPostparto";
import { diasConBebe } from "../data/bebe";
import { getSemanaPostpartoData, semanaPostpartoDesde } from "../data/recuperacionPostparto";
import { loadCitas, toISODate } from "../data/citas";
import { loadRegistros, calcularStreak } from "../data/registroDiario";
import {
  catalogoSintomasPostparto,
  iconoSintomaPostparto,
  esSintomaDeAtencionPostparto,
} from "../data/sintomasPostparto";

const tipoCitaIconos = {
  "Control obstétrico": "🩺",
  "Ecografía": "🖼️",
  "Análisis de sangre": "🩸",
  "Curso de preparto": "🎒",
  "Odontología": "🦷",
  "Nutrición": "🥗",
  "Psicología perinatal": "💬",
  "Primera consulta postparto": "💬",
  "Otro": "🗓️",
};

function formatFechaLarga(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export default function InicioPostparto({ nombre, bebe, onNavigate }) {
  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);

  const [citas, setCitas] = useState([]);
  const [registros, setRegistros] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [view, setView] = useState("list");

  useEffect(() => {
    setCitas(loadCitas());
    setRegistros(loadRegistros());
  }, []);

  const dias = diasConBebe(bebe.fechaNacimiento);
  const semana = semanaPostpartoDesde(bebe.fechaNacimiento);
  const dataSemana = getSemanaPostpartoData(semana);

  const proximaCita = useMemo(() => {
    return [...citas]
      .filter((c) => c.fecha >= todayISO)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))[0];
  }, [citas, todayISO]);

  const streak = useMemo(() => calcularStreak(registros, todayISO), [registros, todayISO]);

  const registroHoy = registros[todayISO] || null;

  const sintomasAtencionHoy = useMemo(() => {
    return (registroHoy?.sintomas || []).filter(esSintomaDeAtencionPostparto);
  }, [registroHoy]);

  if (view === "recuperacion-postparto") {
    return <RecuperacionPostparto onBack={() => setView("list")} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-gray-900">Hola, {nombre || "mamá"} 👋</h2>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              🔥 {streak} {streak === 1 ? "día seguido" : "días seguidos"}
            </span>
          )}
          <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "#ede9fe", color: "var(--lavender)" }}>
            Cuarto trimestre
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Día {dias} con {bebe.nombre || "tu bebé"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 mb-6">
        <div className="bg-gradient-to-br from-rose-500 to-pink-400 rounded-3xl p-6 shadow-sm text-white">
          <p className="text-sm opacity-90 mb-1">Tu bebé</p>
          <p className="text-2xl font-semibold mb-2">{dias} días</p>
          {bebe.peso && <p className="text-sm opacity-90">≈ {bebe.peso} g</p>}
          {bebe.proximoControl && (
            <p className="text-sm opacity-90 mb-4">Próximo control: {bebe.proximoControl}</p>
          )}
          <button
            onClick={() => onNavigate?.("perfil")}
            className="bg-white text-rose-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors mt-2"
          >
            Ver ficha del bebé
          </button>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
          <p className="text-xs text-rose-800 mb-1">Tu recuperación</p>
          <p className="text-lg font-semibold text-gray-900 mb-2">Semana {semana} de 12</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">{dataSemana.hito}</p>
          <button
            onClick={() => setView("recuperacion-postparto")}
            className="bg-white border border-rose-300 text-rose-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-100 transition-colors"
          >
            Ver semana completa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-4">¿Cómo estás hoy?</p>
          {registroHoy ? (
            <button
              onClick={() => setModalAbierto(true)}
              className="w-full flex items-center gap-3 text-left bg-rose-50 border border-rose-100 rounded-xl p-3 hover:border-rose-300 transition-colors"
            >
              <span className="text-xl shrink-0">📝</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Registro de hoy</p>
                <p className="text-xs text-gray-500 truncate">
                  {registroHoy.nota
                    ? registroHoy.nota.slice(0, 60)
                    : "Ánimo y síntomas registrados"}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setModalAbierto(true)}
              className="w-full flex items-center gap-3 text-left bg-white border border-dashed border-rose-200 rounded-xl p-3 hover:border-rose-400 transition-colors"
            >
              <span className="text-xl shrink-0">📝</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Completá tu registro de hoy
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Ánimo, sueño, lactancia, cicatriz — lo que quieras contar
                </p>
              </div>
              <span className="text-rose-400 text-sm">＋</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Próxima cita
            </p>
            {proximaCita ? (
              <button
                onClick={() => onNavigate?.("citas")}
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
                onClick={() => onNavigate?.("citas")}
                className="w-full text-left bg-rose-50 border border-rose-100 rounded-xl p-3 hover:border-rose-300 transition-colors"
              >
                <p className="text-sm text-gray-700">No tenés citas agendadas</p>
                <p className="text-xs text-rose-500 mt-1">+ Agendar una cita</p>
              </button>
            )}
          </div>

          {sintomasAtencionHoy.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm">
              <p className="font-medium mb-1">💡 Vale la pena comentarlo con tu médico</p>
              <p>
                Hoy registraste: {sintomasAtencionHoy.join(", ")}. Esto no es un diagnóstico, es
                solo una sugerencia basada en lo que registraste vos misma.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm">
              ⚠️ Sin alertas activas. Todo en orden hoy.
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setModalAbierto(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-rose-500 text-white pl-5 pr-6 py-4 rounded-full shadow-xl shadow-rose-500/30 hover:bg-rose-600 hover:scale-105 transition-all"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-sm font-semibold">Registrar mi día</span>
      </button>

      {modalAbierto && (
        <RegistroDiarioModal
          fecha={todayISO}
          sintomasSemana={dataSemana.sintomas}
          catalogo={catalogoSintomasPostparto}
          iconoSintoma={iconoSintomaPostparto}
          onClose={() => setModalAbierto(false)}
          onSaved={() => setRegistros(loadRegistros())}
        />
      )}
    </div>
  );
}
