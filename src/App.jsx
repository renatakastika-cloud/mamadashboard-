import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import InicioPanel from "./components/InicioPanel";
import ControlCitas from "./components/ControlCitas";
import BienestarPanel from "./components/BienestarPanel";
import PerfilPanel from "./components/PerfilPanel";
import FeatureListPanel from "./components/FeatureListPanel";
import LandingPage from "./components/landing/LandingPage";
import AuthPage from "./components/auth/AuthPage";
import OnboardingForm from "./components/onboarding/OnboardingForm";
import { getSession, logout, onAuthChange } from "./data/auth";
import { loadPerfil } from "./data/perfil";

export default function App() {
  const [mode, setMode] = useState("loading");
  const [authTab, setAuthTab] = useState("login");
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("inicio");

  const handleNavigate = (section) => {
    setActive(section);
  };

  const enterApp = async (session) => {
    setUser(session);
    const perfil = await loadPerfil();
    setMode(perfil.onboardingCompleted ? "dashboard" : "onboarding");
  };

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        enterApp(session);
      } else {
        setUser(null);
        setMode("landing");
      }
    });

    return onAuthChange((session) => {
      if (session) {
        enterApp(session);
      } else {
        setUser(null);
        setMode((current) => (current === "dashboard" || current === "onboarding" ? "landing" : current));
      }
    });
  }, []);

  const handleAuthSuccess = (loggedUser) => {
    enterApp(loggedUser);
  };

  const handleOnboardingComplete = () => {
    setMode("dashboard");
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setMode("landing");
  };

  if (mode === "loading") {
    return null;
  }

  if (mode === "landing") {
    return (
      <LandingPage
        onGoToAuth={(tab) => {
          setAuthTab(tab);
          setMode("auth");
        }}
        onDevPreview={() => setMode("dashboard")}
      />
    );
  }

  if (mode === "auth") {
    return (
      <AuthPage
        initialTab={authTab}
        onSuccess={handleAuthSuccess}
        onBack={() => setMode("landing")}
      />
    );
  }

  if (mode === "onboarding") {
    return <OnboardingForm nombre={user?.nombre} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="no-print h-14 shrink-0 flex items-center justify-end px-6 border-b border-rose-100 bg-white">
        <button
          onClick={() => handleNavigate("perfil")}
          className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${
            active === "perfil"
              ? "bg-rose-500 text-white"
              : "text-gray-600 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
          Mi Perfil
        </button>
      </header>
      <div className="flex flex-1 min-h-0">
        <Sidebar active={active} onSelect={(id) => handleNavigate(id)} onLogout={handleLogout} />
        <main className="flex-1 p-8 max-w-5xl overflow-y-auto">
          {active === "inicio" ? (
            <InicioPanel nombre={user?.nombre} onNavigate={handleNavigate} />
          ) : active === "citas" ? (
            <ControlCitas />
          ) : active === "bienestar" ? (
            <BienestarPanel />
          ) : active === "perfil" ? (
            <PerfilPanel onLogout={handleLogout} />
          ) : (
            <FeatureListPanel sectionId={active} />
          )}
        </main>
      </div>
    </div>
  );
}
