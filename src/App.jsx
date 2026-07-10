import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import InicioPanel from "./components/InicioPanel";
import EmbarazoPanel from "./components/EmbarazoPanel";
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
  const [embarazoView, setEmbarazoView] = useState("list");
  const [navKey, setNavKey] = useState(0);

  const handleNavigate = (section, subview) => {
    setActive(section);
    setEmbarazoView(subview || "list");
    setNavKey((k) => k + 1);
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
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar active={active} onSelect={(id) => handleNavigate(id)} onLogout={handleLogout} />
      <main className="flex-1 p-8 max-w-5xl">
        {active === "inicio" ? (
          <InicioPanel nombre={user?.nombre} onNavigate={handleNavigate} />
        ) : active === "embarazo" ? (
          <EmbarazoPanel key={navKey} initialView={embarazoView} />
        ) : active === "bienestar" ? (
          <BienestarPanel />
        ) : active === "perfil" ? (
          <PerfilPanel onLogout={handleLogout} />
        ) : (
          <FeatureListPanel sectionId={active} />
        )}
      </main>
    </div>
  );
}
