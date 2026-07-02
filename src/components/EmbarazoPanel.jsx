import { useState } from "react";
import Header from "./Header";
import FeatureCard from "./FeatureCard";
import SeguimientoSemanal from "./SeguimientoSemanal";
import ControlCitas from "./ControlCitas";
import PlanParto from "./PlanParto";
import ChecklistHospital from "./ChecklistHospital";
import RecuperacionPostparto from "./RecuperacionPostparto";
import PrimeraConsultaPostparto from "./PrimeraConsultaPostparto";
import { embarazoCore, embarazoPreparto, embarazoPostparto } from "../data/embarazo";

export default function EmbarazoPanel({ initialView = "list" }) {
  const [view, setView] = useState(initialView);

  if (view === "seguimiento") {
    return <SeguimientoSemanal onBack={() => setView("list")} />;
  }

  if (view === "citas") {
    return <ControlCitas onBack={() => setView("list")} />;
  }

  if (view === "plan-parto") {
    return <PlanParto onBack={() => setView("list")} />;
  }

  if (view === "checklist-hospital") {
    return <ChecklistHospital onBack={() => setView("list")} />;
  }

  if (view === "recuperacion-postparto") {
    return <RecuperacionPostparto onBack={() => setView("list")} />;
  }

  if (view === "primera-consulta-postparto") {
    return <PrimeraConsultaPostparto onBack={() => setView("list")} />;
  }

  return (
    <div>
      <Header
        title="🩺 Mi Embarazo"
        subtitle="Seguimiento del embarazo, salud física, síntomas, citas y preparación médica para el parto"
      />

      <section className="mb-10">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Funcionalidades propias
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {embarazoCore.map((f) => (
            <FeatureCard
              key={f.title}
              {...f}
              onClick={
                f.title === "Seguimiento semanal"
                  ? () => setView("seguimiento")
                  : f.title === "Control de citas"
                  ? () => setView("citas")
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-rose-500 uppercase tracking-wide">
            Bloque Preparto
          </h3>
          <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
            desde S.28
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{embarazoPreparto.nota}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {embarazoPreparto.items.map((f) => (
            <FeatureCard
              key={f.title}
              {...f}
              onClick={
                f.title === "Plan de parto interactivo"
                  ? () => setView("plan-parto")
                  : f.title === "Checklist del hospital"
                  ? () => setView("checklist-hospital")
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-lavender uppercase tracking-wide" style={{ color: "var(--lavender)" }}>
            Bloque Postparto
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "var(--lavender)" }}>
            Mi Recuperación
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{embarazoPostparto.nota}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {embarazoPostparto.items.map((f) => (
            <FeatureCard
              key={f.title}
              {...f}
              onClick={
                f.title === "Semana a semana de recuperación física"
                  ? () => setView("recuperacion-postparto")
                  : f.title === "Primera consulta postparto"
                  ? () => setView("primera-consulta-postparto")
                  : undefined
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
