import { useState } from "react";
import { login, resendSignupCode, signup, verifySignupCode } from "../../data/auth";

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
  const [step, setStep] = useState("form");
  const [tab, setTab] = useState(initialTab);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      setStep("verify");
      return;
    }
    onSuccess(result.user);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await verifySignupCode({ email, code });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess(result.user);
  };

  const handleResend = async () => {
    setError("");
    setResendMsg("");
    const result = await resendSignupCode({ email });
    setResendMsg(result.ok ? "Te reenviamos el código." : result.error);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => {
            if (step === "verify") {
              setStep("form");
              setError("");
              setResendMsg("");
              return;
            }
            onBack();
          }}
          className="text-sm text-gray-500 hover:text-rose-500 mb-6 flex items-center gap-1"
        >
          ← Volver
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🤰</span>
          <span className="font-semibold text-gray-900">Mamá App</span>
        </div>

        {step === "verify" ? (
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-7">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Confirmá tu email</h2>
            <p className="text-xs text-gray-500 mb-5">
              Te enviamos un código a <span className="font-medium text-gray-700">{email}</span>.
              Ingresalo para activar tu cuenta.
            </p>

            <form onSubmit={handleVerify}>
              <div className="mb-2">
                <label className="text-xs text-gray-500 block mb-1">Código de verificación</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className={`${inputClass} text-center tracking-[0.3em]`}
                  maxLength={6}
                />
              </div>

              {error && <p className="text-xs text-red-500 mb-3 mt-3">{error}</p>}
              {resendMsg && <p className="text-xs text-gray-500 mb-3 mt-1">{resendMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-rose-600 transition-colors mt-3 disabled:opacity-60"
              >
                {loading ? "Verificando…" : "Verificar código"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                className="w-full text-xs text-rose-500 hover:text-rose-600 mt-3"
              >
                Reenviar código
              </button>
            </form>
          </div>
        ) : (
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
              {tab === "signup" && password && <PasswordChecklist password={password} />}
            </div>

            {tab === "signup" && (
              <div className="mb-2 mt-3">
                <label className="text-xs text-gray-500 block mb-1">Repetir contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
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
        )}

        <p className="text-xs text-gray-400 text-center mt-5">
          Tus datos se guardan de forma segura en tu cuenta
        </p>
      </div>
    </div>
  );
}
