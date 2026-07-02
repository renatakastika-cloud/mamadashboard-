import Header from "./Header";
import { sections, mvpFeatures } from "../data/sections";

export default function FeatureListPanel({ sectionId }) {
  const section = sections.find((s) => s.id === sectionId);
  const features = mvpFeatures[sectionId] || [];

  return (
    <div>
      <Header title={`${section.icon} ${section.label}`} subtitle="Funcionalidades incluidas en el MVP v1.0" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((f) => (
          <div
            key={f}
            className="bg-white border border-rose-100 rounded-xl p-4 text-sm text-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
