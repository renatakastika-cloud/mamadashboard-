import { useState } from "react";
import { login, signup } from "../../data/auth";

const inputClass =
  "w-full border border-rose-100 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-300";

export default function AuthPage({ initialTab = "login", onSuccess, onBack }) {
  const [tab, setTab] = useState(initialTab);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const result =
      tab === "login" ? login({ email, password }) : signup({ nombre, email, password });

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess(result.user);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-rose-500 mb-6 flex items-center gap-1"
        >
          ← Volver
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🤰</span>
          <span className="font-semibold text-gray-900">Mamá App</span>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-7">
          <div className="flex bg-rose-50 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
                tab === "login" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setTab("signup"); setError(""); }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
                tab === "signup" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {tab === "signup" && (
              <div className="mb-3">
                <label className="text-xs text-gray-500 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className={inputClass}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className={inputClass}
              />
            </div>

            <div className="mb-2">
              <label className="text-xs text-gray-500 block mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button
              type="submit"
              className="w-full bg-rose-500 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-rose-600 transition-colors mt-3"
            >
              {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          Tus datos se guardan localmente en este navegador (modo desarrollo)
        </p>
      </div>
    </div>
  );
}
