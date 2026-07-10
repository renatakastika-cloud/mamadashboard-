import { useEffect, useState } from "react";
import Header from "./Header";
import FeatureCard from "./FeatureCard";
import HistorialEmbarazo from "./HistorialEmbarazo";
import ContactosMedicos from "./ContactosMedicos";
import PlanParto from "./PlanParto";
import ChecklistHospital from "./ChecklistHospital";
import { emptyPerfil, loadPerfil, savePerfil } from "../data/perfil";
import { totalWeeks } from "../data/seguimientoSemanal";
import { emptyBebe, loadBebe, saveBebe } from "../data/bebe";

const inputClass =
  "w-full border border-rose-100 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-300";

const seccionesTarjetas = [
  {
    icon: "📖",
    title: "Historial de mi embarazo",
    desc: "Todo lo que fuiste registrando, con exportación a PDF",
    view: "historial",
  },
  {
    icon: "📝",
    title: "Plan de parto interactivo",
    desc: "Generador personalizable, exportable en PDF para el equipo médico",
    view: "plan-parto",
  },
  {
    icon: "🎒",
    title: "Checklist del hospital",
    desc: "Bolsa, documentos, personas de contacto",
    view: "checklist-hospital",
  },
  {
    icon: "📞",
    title: "Contactos del equipo médico",
    desc: "Todos los teléfonos importantes, a mano para una emergencia",
    view: "contactos-medicos",
  },
];

const otrasTarjetas = [
  { icon: "🎧", title: "Preferencias de contenido", desc: "Tipos favoritos, idioma, notificaciones" },
  { icon: "🔒", title: "Privacidad", desc: "Control total sobre tus datos compartidos" },
];

const CANTIDAD_OPTIONS = [
  { value: 1, label: "1 bebé" },
  { value: 2, label: "Mellizos" },
  { value: 3, label: "3 o más" },
];

const SEXO_OPTIONS = [
  { value: "nena", label: "Nena" },
  { value: "nene", label: "Nene" },
  { value: "mixto", label: "Uno de cada uno" },
  { value: "no-se", label: "Todavía no sé" },
];

export default function PerfilPanel({ onLogout }) {
  const [view, setView] = useState("list");
  const [perfil, setPerfil] = useState(emptyPerfil);
  const [saved, setSaved] = useState(false);
  const [bebe, setBebe] = useState(emptyBebe);
  const [editandoBebe, setEditandoBebe] = useState(false);
  const [bebeSaved, setBebeSaved] = useState(false);

  useEffect(() => {
    loadPerfil().then(setPerfil);
    setBebe(loadBebe());
  }, []);

  if (view === "historial") {
    return <HistorialEmbarazo onBack={() => setView("list")} />;
  }

  if (view === "contactos-medicos") {
    return <ContactosMedicos onBack={() => setView("list")} />;
  }

  if (view === "plan-parto") {
    return <PlanParto onBack={() => setView("list")} />;
  }

  if (view === "checklist-hospital") {
    return <ChecklistHospital onBack={() => setView("list")} />;
  }

  const update = (field, value) => {
    setPerfil((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleGuardar = async () => {
    await savePerfil(perfil);
    setSaved(true);
  };

  const updateBebe = (field, value) => {
    setBebe((prev) => ({ ...prev, [field]: value }));
    setBebeSaved(false);
  };

  const handleGuardarBebe = () => {
    if (!bebe.fechaNacimiento) return;
    const next = { ...bebe, registrado: true };
    setBebe(next);
    saveBebe(next);
    setBebeSaved(true);
    setEditandoBebe(false);
  };

  return (
    <div>
      <Header
        title="📋 Mi Perfil"
        subtitle="Tus datos, contactos y preferencias — todo organizado en un solo lugar"
      />

      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm mb-6">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Datos personales
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Semana actual de embarazo
            </label>
            <input
              type="number"
              min={1}
              max={totalWeeks}
              value={perfil.semanaActual}
              onChange={(e) => update("semanaActual", Number(e.target.value))}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              Esto actualiza el Inicio y el seguimiento en toda la app
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Fecha probable de parto</label>
            <input
              type="date"
              value={perfil.fpp}
              onChange={(e) => update("fpp", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Médico / obstetra</label>
            <input
              type="text"
              value={perfil.medico}
              onChange={(e) => update("medico", e.target.value)}
              placeholder="Ej: Dra. Pérez"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Hospital / clínica</label>
            <input
              type="text"
              value={perfil.hospital}
              onChange={(e) => update("hospital", e.target.value)}
              placeholder="Ej: Clínica del Sol"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-500 block mb-2">¿Cuántos bebés esperás?</label>
          <div className="flex gap-2">
            {CANTIDAD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("cantidadBebes", opt.value)}
                className={`flex-1 text-sm font-medium py-2 rounded-xl border transition-colors ${
                  perfil.cantidadBebes === opt.value
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-600 border-rose-100 hover:border-rose-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-500 block mb-2">¿Sabés el sexo?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SEXO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("sexo", opt.value)}
                className={`text-sm font-medium py-2 rounded-xl border transition-colors ${
                  perfil.sexo === opt.value
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-600 border-rose-100 hover:border-rose-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGuardar}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Guardar datos
          </button>
          {saved && <span className="text-sm text-green-600">Guardado ✓</span>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm mb-6">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Tu bebé
        </p>

        {!bebe.registrado && !editandoBebe && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-gray-900">¿Ya nació tu bebé?</p>
              <p className="text-sm text-gray-500 mt-1">
                Registrá el nacimiento para activar tu cuarto trimestre en Inicio
              </p>
            </div>
            <button
              onClick={() => setEditandoBebe(true)}
              className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors whitespace-nowrap"
            >
              Registrar nacimiento
            </button>
          </div>
        )}

        {bebe.registrado && !editandoBebe && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-gray-900">{bebe.nombre || "Tu bebé"}</p>
              <p className="text-sm text-gray-500 mt-1">
                Nació el {bebe.fechaNacimiento}
                {bebe.peso ? ` · ${bebe.peso} g` : ""}
                {bebe.proximoControl ? ` · próximo control ${bebe.proximoControl}` : ""}
              </p>
            </div>
            <button
              onClick={() => setEditandoBebe(true)}
              className="text-sm text-rose-500 hover:underline whitespace-nowrap"
            >
              Editar
            </button>
          </div>
        )}

        {editandoBebe && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={bebe.fechaNacimiento}
                  onChange={(e) => updateBebe("fechaNacimiento", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nombre (opcional)</label>
                <input
                  type="text"
                  value={bebe.nombre}
                  onChange={(e) => updateBebe("nombre", e.target.value)}
                  placeholder="Ej: Sofía"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Peso (g)</label>
                <input
                  type="number"
                  min={0}
                  value={bebe.peso}
                  onChange={(e) => updateBebe("peso", e.target.value)}
                  placeholder="Ej: 3400"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Próximo control</label>
                <input
                  type="date"
                  value={bebe.proximoControl}
                  onChange={(e) => updateBebe("proximoControl", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGuardarBebe}
                disabled={!bebe.fechaNacimiento}
                className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditandoBebe(false)}
                className="text-sm text-gray-500 hover:text-rose-500"
              >
                Cancelar
              </button>
              {bebeSaved && <span className="text-sm text-green-600">Guardado ✓</span>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {seccionesTarjetas.map((t) => (
          <FeatureCard
            key={t.title}
            icon={t.icon}
            title={t.title}
            desc={t.desc}
            onClick={() => setView(t.view)}
          />
        ))}
      </div>

      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Próximamente
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {otrasTarjetas.map((t) => (
          <div
            key={t.title}
            className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm flex items-start gap-3"
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <div>
              <p className="font-medium text-gray-900 text-sm">{t.title}</p>
              <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-rose-100">
        <button
          onClick={onLogout}
          className="text-sm text-rose-500 hover:text-rose-600 font-medium"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
