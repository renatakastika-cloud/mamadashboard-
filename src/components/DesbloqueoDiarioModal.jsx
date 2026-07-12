import { useState } from "react";
import { configurarPassword, desbloquearDiario } from "../data/diarioSeguridad";

function soloDigitos(valor) {
  return valor.replace(/\D/g, "").slice(0, 4);
}

export default function DesbloqueoDiarioModal({ modo, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (modo === "crear") {
      if (pin.length !== 4) {
        setError("El PIN debe tener 4 números.");
        return;
      }
      if (pin !== confirmar) {
        setError("Los PIN no coinciden.");
        return;
      }
      setCargando(true);
      await configurarPassword(pin);
      await desbloquearDiario(pin);
      setCargando(false);
      onSuccess();
      return;
    }

    setCargando(true);
    const ok = await desbloquearDiario(pin);
    setCargando(false);
    if (!ok) {
      setError("PIN incorrecto.");
      return;
    }
    onSuccess();
  };

  const inputClass =
    "w-full border border-rose-100 rounded-xl p-2.5 text-center text-lg tracking-[0.3em] mb-3 focus:outline-none focus:border-rose-300";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-900">
            {modo === "crear" ? "Creá tu PIN" : "🔒 Entradas privadas"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          {modo === "crear"
            ? "Elegí un PIN de 4 números para proteger el texto de las entradas que marques como privadas. Recordalo bien: si lo olvidás, no vas a poder recuperar ese texto."
            : "Ingresá tu PIN de 4 números para ver el contenido de tus entradas privadas."}
        </p>

        {modo === "crear" && <p className="text-xs text-gray-500 mb-1">PIN</p>}
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(soloDigitos(e.target.value))}
          placeholder="••••"
          className={inputClass}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && modo !== "crear" && handleSubmit()}
        />
        {modo === "crear" && (
          <>
            <p className="text-xs text-gray-500 mb-1">Repetí el PIN</p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={confirmar}
              onChange={(e) => setConfirmar(soloDigitos(e.target.value))}
              placeholder="••••"
              className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </>
        )}
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={cargando}
          className="w-full bg-rose-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
        >
          {cargando ? "Un momento..." : modo === "crear" ? "Crear y continuar" : "Desbloquear"}
        </button>
      </div>
    </div>
  );
}
