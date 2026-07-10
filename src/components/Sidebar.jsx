import { sections } from "../data/sections";

export default function Sidebar({ active, onSelect, onLogout }) {
  return (
    <aside className="no-print w-64 shrink-0 h-full bg-white border-r border-rose-100 flex flex-col">
      <div className="px-6 py-6 border-b border-rose-100">
        <p className="text-xs font-medium tracking-wide text-rose-400 uppercase">Tu compañera de embarazo</p>
        <h1 className="text-lg font-semibold text-gray-900 mt-1">Mamá App</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-rose-100">
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-rose-500"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
