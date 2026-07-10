import { useState } from "react";
import { login, signup } from "../../data/auth";

const inputClass =
  "w-full border border-rose-100 rounded-xl p-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-300";

const PASSWORD_RULES = [
  { key: "length", label: "Al menos 8 caracteres", test: (v) => v.length >= 8 },
  { key: "upper", label: "Al menos una mayúscula", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "Al menos una minúscula", test: (v) => /[a-z]/.test(v) },
  { key: "number", label: "Al menos un número", test: (v) => /[0-9]/.test(v) },
  {
    key: "special",
    label: "Al menos un carácter especial (!@#$%^&*)",
    test: (v) => /[!@#$%^&*]/.test(v),
  },
];

function EyeIcon({ off }) {
  return off ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}

function PasswordChecklist({ password }) {
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.key}
            className={`text-xs flex items-center gap-1.5 ${
              passed ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span>{passed ? "✓" : "✕"}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function AuthPage({ initialTab = "login", onSuccess, onBack }) {
  const [tab, setTab] = useState(initialTab);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (tab === "signup") {
      if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
        setError("La contraseña no cumple con todos los requisitos.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    setLoading(true);
    const result =
      tab === "login"
        ? await login({ email, password })
        : await signup({ nombre, email, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsVerification) {
      setTab("login");
      setPassword("");
      setConfirmPassword("");
      setInfoMsg("Cuenta creada. Iniciá sesión con tu email y contraseña.");
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
              onClick={() => { setTab("login"); setError(""); setInfoMsg(""); }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
                tab === "login" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setTab("signup"); setError(""); setInfoMsg(""); }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
                tab === "signup" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {infoMsg && <p className="text-xs text-green-600 mb-3">{infoMsg}</p>}
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
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {tab === "signup" && password && <PasswordChecklist password={password} />}
            </div>

            {tab === "signup" && (
              <div className="mb-2 mt-3">
                <label className="text-xs text-gray-500 block mb-1">Repetir contraseña</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
                )}
              </div>
            )}

            {error && <p className="text-xs text-red-500 mb-3 mt-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-rose-600 transition-colors mt-3 disabled:opacity-60"
            >
              {loading ? "Un momento…" : tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          Tus datos se guardan de forma segura en tu cuenta
        </p>
      </div>
    </div>
  );
}
