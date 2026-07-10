import { useEffect, useState } from "react";
import Header from "./Header";
import { loadPlan, savePlan, emptyPlan } from "../data/planParto";

const tipoPartoOpciones = [
  { value: "natural", label: "Parto natural / vaginal" },
  { value: "epidural", label: "Vaginal con epidural" },
  { value: "cesarea", label: "Cesárea programada" },
  { value: "abierta", label: "Abierta a indicación médica" },
];

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300";

export default function PlanParto({ onBack }) {
  const [plan, setPlan] = useState(emptyPlan);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPlan(loadPlan());
  }, []);

  const update = (field, value) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleArchivos = (fileList) => {
    const files = Array.from(fileList);
    const maxSize = 4 * 1024 * 1024; // 4MB por archivo, límite razonable para localStorage
    const validos = files.filter((f) => f.size <= maxSize);
    const muyGrandes = files.length - validos.length;

    Promise.all(
      validos.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: `${Date.now()}-${file.name}`,
                nombre: file.name,
                tipo: file.type,
                tamano: file.size,
                dataUrl: reader.result,
              });
            reader.readAsDataURL(file);
          })
      )
    ).then((nuevos) => {
      setPlan((prev) => ({ ...prev, archivos: [...prev.archivos, ...nuevos] }));
      setSaved(false);
      if (muyGrandes > 0) {
        alert(`${muyGrandes} archivo(s) no se adjuntaron por superar los 4MB.`);
      }
    });
  };

  const eliminarArchivo = (id) => {
    setPlan((prev) => ({ ...prev, archivos: prev.archivos.filter((a) => a.id !== id) }));
    setSaved(false);
  };

  const handleGuardar = () => {
    savePlan(plan);
    setSaved(true);
  };

  const handleExportar = () => {
    savePlan(plan);
    window.print();
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="no-print text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
      >
        ← Volver a Mi Perfil
      </button>

      <div className="no-print">
        <Header
          title="📝 Plan de parto interactivo"
          subtitle="Completá tus preferencias y exportalo en PDF para tu equipo médico"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Datos generales
            </p>
            <Field label="Tu nombre">
              <input
                type="text"
                value={plan.nombre}
                onChange={(e) => update("nombre", e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha probable de parto">
                <input
                  type="date"
                  value={plan.fpp}
                  onChange={(e) => update("fpp", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Médico / obstetra">
                <input
                  type="text"
                  value={plan.medico}
                  onChange={(e) => update("medico", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Hospital / clínica">
              <input
                type="text"
                value={plan.hospital}
                onChange={(e) => update("hospital", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Acompañantes deseados durante el parto">
              <input
                type="text"
                value={plan.acompanantes}
                onChange={(e) => update("acompanantes", e.target.value)}
                placeholder="Ej: mi pareja y mi madre"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Preferencias de parto
            </p>
            <Field label="Tipo de parto deseado">
              <select
                value={plan.tipoPartoDeseado}
                onChange={(e) => update("tipoPartoDeseado", e.target.value)}
                className={inputClass}
              >
                {tipoPartoOpciones.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Manejo del dolor">
              <input
                type="text"
                value={plan.manejoDolor}
                onChange={(e) => update("manejoDolor", e.target.value)}
                placeholder="Ej: epidural, técnicas de respiración, pelota de pilates"
                className={inputClass}
              />
            </Field>
            <Field label="Ambiente preferido">
              <input
                type="text"
                value={plan.ambiente}
                onChange={(e) => update("ambiente", e.target.value)}
                placeholder="Ej: luz tenue, música, silencio"
                className={inputClass}
              />
            </Field>
            <Field label="Posiciones que querés probar">
              <input
                type="text"
                value={plan.posiciones}
                onChange={(e) => update("posiciones", e.target.value)}
                placeholder="Ej: en cuclillas, en pelota, caminando"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Intervenciones médicas
            </p>
            <Field label="Episiotomía">
              <input
                type="text"
                value={plan.episiotomia}
                onChange={(e) => update("episiotomia", e.target.value)}
                placeholder="Ej: solo si es estrictamente necesaria"
                className={inputClass}
              />
            </Field>
            <Field label="Monitoreo fetal">
              <input
                type="text"
                value={plan.monitoreoFetal}
                onChange={(e) => update("monitoreoFetal", e.target.value)}
                placeholder="Ej: continuo / intermitente"
                className={inputClass}
              />
            </Field>
            <Field label="Si la situación requiere cesárea">
              <input
                type="text"
                value={plan.siCesarea}
                onChange={(e) => update("siCesarea", e.target.value)}
                placeholder="Ej: quiero contacto piel a piel en quirófano si es posible"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Después del nacimiento
            </p>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={plan.contactoPielAPiel}
                onChange={(e) => update("contactoPielAPiel", e.target.checked)}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Contacto piel a piel inmediato</span>
            </label>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={plan.cordonRetrasado}
                onChange={(e) => update("cordonRetrasado", e.target.checked)}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Clampeo retrasado del cordón umbilical</span>
            </label>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={plan.lactanciaInmediata}
                onChange={(e) => update("lactanciaInmediata", e.target.checked)}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Lactancia en la primera hora</span>
            </label>
            <Field label="¿Quién corta el cordón?">
              <input
                type="text"
                value={plan.personaCorteCordon}
                onChange={(e) => update("personaCorteCordon", e.target.value)}
                placeholder="Ej: mi pareja"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Notas para el equipo médico
            </p>
            <textarea
              value={plan.notasEquipoMedico}
              onChange={(e) => update("notasEquipoMedico", e.target.value)}
              placeholder="Cualquier otra preferencia, alergia o información relevante"
              className={`${inputClass} resize-none`}
              rows={3}
            />
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Archivos adjuntos
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Subí estudios, ecografías o documentos para llevar junto al plan (máx. 4MB por archivo)
            </p>

            <label className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium px-4 py-2 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors">
              📎 Subir archivo
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files.length) handleArchivos(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>

            {plan.archivos.length > 0 && (
              <ul className="mt-4 space-y-2">
                {plan.archivos.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2"
                  >
                    <a
                      href={a.dataUrl}
                      download={a.nombre}
                      className="text-sm text-gray-700 hover:text-rose-600 truncate mr-3"
                    >
                      📄 {a.nombre}{" "}
                      <span className="text-xs text-gray-400">
                        ({Math.round(a.tamano / 1024)} KB)
                      </span>
                    </a>
                    <button
                      onClick={() => eliminarArchivo(a.id)}
                      className="text-xs text-gray-400 hover:text-red-500 hover:underline whitespace-nowrap"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleGuardar}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Guardar plan
          </button>
          <button
            onClick={handleExportar}
            className="bg-white border border-rose-300 text-rose-500 text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            Exportar / Imprimir PDF
          </button>
          {saved && <span className="text-sm text-green-600">Guardado ✓</span>}
        </div>
      </div>

      <PlanPreview plan={plan} />
    </div>
  );
}

function PlanPreview({ plan }) {
  const tipoLabel =
    tipoPartoOpciones.find((o) => o.value === plan.tipoPartoDeseado)?.label || "";

  return (
    <div className="print-only text-gray-900 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold mb-1">Plan de Parto</h1>
      <p className="text-gray-500 mb-6">{plan.nombre || "—"}</p>

      <h2 className="font-semibold mt-4 mb-1">Datos generales</h2>
      <p>Fecha probable de parto: {plan.fpp || "—"}</p>
      <p>Médico / obstetra: {plan.medico || "—"}</p>
      <p>Hospital / clínica: {plan.hospital || "—"}</p>
      <p>Acompañantes: {plan.acompanantes || "—"}</p>

      <h2 className="font-semibold mt-4 mb-1">Preferencias de parto</h2>
      <p>Tipo de parto deseado: {tipoLabel}</p>
      <p>Manejo del dolor: {plan.manejoDolor || "—"}</p>
      <p>Ambiente preferido: {plan.ambiente || "—"}</p>
      <p>Posiciones a probar: {plan.posiciones || "—"}</p>

      <h2 className="font-semibold mt-4 mb-1">Intervenciones médicas</h2>
      <p>Episiotomía: {plan.episiotomia || "—"}</p>
      <p>Monitoreo fetal: {plan.monitoreoFetal || "—"}</p>
      <p>En caso de cesárea: {plan.siCesarea || "—"}</p>

      <h2 className="font-semibold mt-4 mb-1">Después del nacimiento</h2>
      <p>Contacto piel a piel inmediato: {plan.contactoPielAPiel ? "Sí" : "No"}</p>
      <p>Clampeo retrasado del cordón: {plan.cordonRetrasado ? "Sí" : "No"}</p>
      <p>Lactancia en la primera hora: {plan.lactanciaInmediata ? "Sí" : "No"}</p>
      <p>Quién corta el cordón: {plan.personaCorteCordon || "—"}</p>

      <h2 className="font-semibold mt-4 mb-1">Notas para el equipo médico</h2>
      <p>{plan.notasEquipoMedico || "—"}</p>

      <h2 className="font-semibold mt-4 mb-1">Archivos adjuntos</h2>
      {plan.archivos.length === 0 ? (
        <p>—</p>
      ) : (
        <ul>
          {plan.archivos.map((a) => (
            <li key={a.id}>{a.nombre}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
