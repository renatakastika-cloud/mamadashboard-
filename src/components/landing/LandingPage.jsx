import { pilares, seccionesDetalle, stats } from "../../data/landingContent";

export default function LandingPage({ onGoToAuth, onDevPreview }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 bg-[var(--bg)]/90 backdrop-blur border-b border-rose-100 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤰</span>
            <span className="font-semibold text-gray-900">Mamá App</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onGoToAuth("login")}
              className="text-sm text-gray-600 hover:text-rose-500"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => onGoToAuth("signup")}
              className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 text-center pt-16 pb-14">
        <span className="inline-block bg-rose-100 text-rose-600 text-xs font-medium px-3 py-1 rounded-full mb-6">
          ✓ Contenido médico verificado por profesionales
        </span>
        <h1 className="text-4xl sm:text-6xl font-semibold text-gray-900 leading-tight mb-6">
          Tu compañera de embarazo:
          <br />
          <span className="text-rose-500">médica, emocional</span> y siempre disponible
        </h1>
        <p className="text-gray-500 text-lg mb-9 max-w-xl mx-auto">
          La única app que te acompaña desde el primer síntoma hasta los primeros meses con tu
          bebé — información confiable, bienestar emocional y una comunidad real, todo
          personalizado para ti.
        </p>
        <button
          onClick={() => onGoToAuth("signup")}
          className="bg-rose-500 text-white text-sm font-medium px-7 py-3.5 rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
        >
          Crear mi cuenta gratis
        </button>
      </section>

      {/* STATS */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-rose-100 rounded-2xl p-6 text-center shadow-sm"
            >
              <p className="text-3xl font-semibold text-rose-500">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUÉ ES */}
      <section className="bg-white border-y border-rose-100">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-5">
            No es una app más de embarazo
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            La mayoría de las apps te dan una ficha semanal y poco más. Mamá App integra el
            seguimiento médico, tu salud emocional, contenido en audio y una comunidad real —
            todo en un solo lugar, y todo respaldado por profesionales de la salud.
          </p>
        </div>
      </section>

      {/* PILARES / CONFIANZA MÉDICA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-3">
          Pensada con médicos, no solo para ellos
        </h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-12">
          Todo el contenido clínico pasa por una revisión profesional antes de llegar a vos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pilares.map((p) => (
            <div
              key={p.title}
              className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm"
            >
              <span className="text-3xl">{p.icon}</span>
              <p className="font-semibold text-gray-900 mt-4 mb-2">{p.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DETALLE DE SECCIONES */}
      <section className="bg-white border-y border-rose-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-3">
            Todo lo que tenés dentro de la app
          </h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
            Seis áreas integradas, pensadas para acompañarte en cada etapa del viaje.
          </p>

          <div className="space-y-14">
            {seccionesDetalle.map((s, i) => (
              <div
                key={s.title}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 text-2xl mb-4">
                    {s.icon}
                  </div>
                  <p className="text-rose-500 text-sm font-medium mb-1">{s.tagline}</p>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-500 mb-4 leading-relaxed">{s.desc}</p>
                  <ul className="space-y-2">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-rose-400 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={`bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl aspect-[4/3] flex items-center justify-center text-6xl shadow-sm ${
                    i % 2 === 1 ? "md:order-1" : ""
                  }`}
                >
                  {s.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-5">
          Empezá a acompañarte hoy
        </h2>
        <p className="text-gray-500 text-lg mb-9">
          Creá tu cuenta gratis y empezá tu seguimiento personalizado, semana a semana.
        </p>
        <button
          onClick={() => onGoToAuth("signup")}
          className="bg-rose-500 text-white text-sm font-medium px-7 py-3.5 rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
        >
          Crear mi cuenta gratis
        </button>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-rose-100 flex items-center justify-between text-xs text-gray-400">
        <span>© 2026 Mamá App</span>
        <button onClick={onDevPreview} className="hover:text-rose-400">
          Vista previa del dashboard (solo desarrollo)
        </button>
      </footer>
    </div>
  );
}
