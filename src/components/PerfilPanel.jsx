import { useEffect, useState } from "react";
import Header from "./Header";
import { loadPerfil, savePerfil } from "../data/perfil";
import { totalWeeks } from "../data/seguimientoSemanal";

const inputClass =
  "w-full border border-rose-100 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-300";

const otrasTarjetas = [
  { icon: "📞", title: "Contactos de emergencia", desc: "Médicos, hospital, familiares" },
  { icon: "🎧", title: "Preferencias de contenido", desc: "Tipos favoritos, idioma, notificaciones" },
  { icon: "🔒", title: "Privacidad", desc: "Control total sobre tus datos compartidos" },
];

export default function PerfilPanel() {
  const [perfil, setPerfil] = useState(loadPerfil());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPerfil(loadPerfil());
  }, []);

  const update = (field, value) => {
    setPerfil((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleGuardar = () => {
    savePerfil(perfil);
    setSaved(true);
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
    </div>
  );
}
