import { useMemo } from "react";

const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];
const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarioMensual({
  mes,
  fechasConEntrada,
  onCambiarMes,
  onSelect,
  onSelectMes,
  seleccionada,
}) {
  const celdas = useMemo(() => {
    const primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const diaSemanaInicio = (primero.getDay() + 6) % 7;
    const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const lista = [];
    for (let i = 0; i < diaSemanaInicio; i++) lista.push(null);
    for (let d = 1; d <= diasEnMes; d++) lista.push(new Date(mes.getFullYear(), mes.getMonth(), d));
    return lista;
  }, [mes]);

  return (
    <div className="bg-white border border-rose-100 rounded-xl shadow-lg p-3 w-60">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => onCambiarMes(-1)}
          className="text-gray-400 hover:text-rose-500 px-1 text-xs"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onSelectMes(new Date(mes.getFullYear(), mes.getMonth(), 1))}
          className="text-xs font-semibold text-gray-800 hover:text-rose-500 capitalize transition-colors"
          title="Ver todas las entradas de este mes"
        >
          {meses[mes.getMonth()]} {mes.getFullYear()}
        </button>
        <button
          type="button"
          onClick={() => onCambiarMes(1)}
          className="text-gray-400 hover:text-rose-500 px-1 text-xs"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-gray-400 uppercase mb-1">
        {diasSemana.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {celdas.map((d, i) => {
          if (!d) return <span key={`vacio-${i}`} />;
          const iso = toISO(d);
          const esSeleccionada = iso === seleccionada;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded-md text-[11px] flex items-center justify-center relative transition-colors ${
                esSeleccionada ? "bg-rose-500 text-white font-semibold" : "text-gray-700 hover:bg-rose-50"
              }`}
            >
              {d.getDate()}
              {fechasConEntrada.has(iso) && !esSeleccionada && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
