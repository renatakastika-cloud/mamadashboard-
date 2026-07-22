import { useEffect, useState } from "react";
import Header from "./Header";
import GruposChat from "./GruposChat";
import Foro from "./Foro";
import { loadPerfil } from "../data/perfil";
import { loadBebe } from "../data/bebe";
import { semanaPostpartoDesde } from "../data/recuperacionPostparto";
import { loadGrupos, calcularGrupoObjetivo, unirseAGrupo, asegurarPerfilPublico } from "../data/comunidad";

export default function ComunidadPanel({ nombre }) {
  const [tab, setTab] = useState("grupos");
  const [grupo, setGrupo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      await asegurarPerfilPublico(nombre);
      const [perfil, bebe, grupos] = await Promise.all([loadPerfil(), Promise.resolve(loadBebe()), loadGrupos()]);
      const esPostparto = bebe.registrado;
      const objetivo = calcularGrupoObjetivo(grupos, {
        semanaActual: perfil.semanaActual,
        esPostparto,
        semanaPostparto: esPostparto ? semanaPostpartoDesde(bebe.fechaNacimiento) : null,
      });
      if (objetivo) await unirseAGrupo(objetivo.id);
      if (activo) {
        setGrupo(objetivo);
        setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [nombre]);

  return (
    <div>
      <Header title="👥 Comunidad" subtitle="Un espacio para acompañarte y acompañar a otras mamás" />

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("grupos")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "grupos" ? "bg-rose-500 text-white shadow-sm" : "bg-white border border-rose-100 text-gray-600 hover:border-rose-300"
          }`}
        >
          💬 Grupos
        </button>
        <button
          onClick={() => setTab("foro")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "foro" ? "bg-rose-500 text-white shadow-sm" : "bg-white border border-rose-100 text-gray-600 hover:border-rose-300"
          }`}
        >
          📝 Foro
        </button>
      </div>

      {cargando ? (
        <p className="text-sm text-gray-400 text-center py-8">Cargando comunidad...</p>
      ) : tab === "grupos" ? (
        <GruposChat grupo={grupo} nombre={nombre} />
      ) : (
        <Foro />
      )}
    </div>
  );
}
