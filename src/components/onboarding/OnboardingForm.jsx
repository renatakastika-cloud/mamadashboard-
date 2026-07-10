import { useState } from "react";
import { savePerfil } from "../../data/perfil";
import { totalWeeks } from "../../data/seguimientoSemanal";

const inputClass =
  "w-full border border-rose-100 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-300";

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

export default function OnboardingForm({ nombre, onComplete }) {
  const [semanaActual, setSemanaActual] = useState(24);
  const [fpp, setFpp] = useState("");
  const [medico, setMedico] = useState("");
  const [hospital, setHospital] = useState("");
  const [cantidadBebes, setCantidadBebes] = useState(1);
  const [sexo, setSexo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await savePerfil({
      semanaActual,
      fpp,
      medico,
      hospital,
      cantidadBebes,
      sexo,
      onboardingCompleted: true,
    });
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🤰</span>
          <span className="font-semibold text-gray-900">Mamá App</span>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-7">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            {nombre ? `¡Bienvenida, ${nombre}!` : "¡Bienvenida!"}
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            Contanos un poco sobre tu embarazo para personalizar tu experiencia. Después vas a
            poder modificar todo esto desde Mi Perfil.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">Semana actual de embarazo</label>
              <input
                type="number"
                min={1}
                max={totalWeeks}
                value={semanaActual}
                onChange={(e) => setSemanaActual(Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">
                Fecha probable de parto (opcional)
              </label>
              <input
                type="date"
                value={fpp}
                onChange={(e) => setFpp(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">Médico / obstetra (opcional)</label>
              <input
                type="text"
                value={medico}
                onChange={(e) => setMedico(e.target.value)}
                placeholder="Ej: Dra. Pérez"
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">Hospital / clínica (opcional)</label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="Ej: Clínica del Sol"
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-2">¿Cuántos bebés esperás?</label>
              <div className="flex gap-2">
                {CANTIDAD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCantidadBebes(opt.value)}
                    className={`flex-1 text-sm font-medium py-2 rounded-xl border transition-colors ${
                      cantidadBebes === opt.value
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white text-gray-600 border-rose-100 hover:border-rose-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs text-gray-500 block mb-2">¿Sabés el sexo?</label>
              <div className="grid grid-cols-2 gap-2">
                {SEXO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSexo(opt.value)}
                    className={`text-sm font-medium py-2 rounded-xl border transition-colors ${
                      sexo === opt.value
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white text-gray-600 border-rose-100 hover:border-rose-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60"
            >
              {loading ? "Guardando…" : "Guardar y continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
