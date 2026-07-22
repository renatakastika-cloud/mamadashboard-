import { useEffect, useState } from "react";
import {
  CATEGORIAS,
  loadPosts,
  crearPost,
  loadComentarios,
  crearComentario,
  toggleLike,
  reportar,
} from "../data/comunidad";

function ComposerPost({ onClose, onPosted }) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState("general");
  const [anonimo, setAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;
    setEnviando(true);
    await crearPost({ titulo, contenido, categoria, esAnonimo: anonimo });
    setEnviando(false);
    onPosted();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm mb-4 space-y-3">
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="border border-rose-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
      >
        {CATEGORIAS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título (opcional)"
        className="w-full border border-rose-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
      />
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Hoy hice esta consigna y me re ayudó..."
        rows={3}
        className="w-full border border-rose-100 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-rose-300 resize-none"
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setAnonimo((v) => !v)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            anonimo ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-rose-100 text-gray-500 hover:border-rose-300"
          }`}
        >
          {anonimo ? "🕶️ Publicar como anónima" : "Publicar con mi nombre"}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando || !contenido.trim()}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            Publicar
          </button>
        </div>
      </div>
    </form>
  );
}

function Comentarios({ postId, onComentado }) {
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [cargando, setCargando] = useState(true);

  const refrescar = async () => {
    setCargando(true);
    setComentarios(await loadComentarios(postId));
    setCargando(false);
  };

  useEffect(() => {
    refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const contenido = texto;
    setTexto("");
    await crearComentario(postId, contenido, anonimo);
    await refrescar();
    onComentado();
  };

  return (
    <div className="mt-4 pt-4 border-t border-rose-50 space-y-3">
      {cargando ? (
        <p className="text-xs text-gray-400">Cargando comentarios...</p>
      ) : (
        comentarios.map((c) => (
          <div key={c.id} className="bg-rose-50 rounded-xl px-3 py-2">
            <p className="text-xs font-semibold text-rose-500">{c.nombreMostrado}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.contenido}</p>
          </div>
        ))
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí un comentario..."
          className="flex-1 border border-rose-100 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-rose-300"
        />
        <button
          type="button"
          onClick={() => setAnonimo((v) => !v)}
          className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
            anonimo ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-rose-100 text-gray-500"
          }`}
          title="Comentar de forma anónima"
        >
          🕶️
        </button>
        <button type="submit" className="text-sm text-rose-500 font-medium hover:text-rose-600 shrink-0">
          Enviar
        </button>
      </form>
    </div>
  );
}

export default function Foro() {
  const [posts, setPosts] = useState([]);
  const [categoria, setCategoria] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [mostrarComposer, setMostrarComposer] = useState(false);
  const [postAbierto, setPostAbierto] = useState(null);

  const refrescar = async () => {
    setCargando(true);
    setPosts(await loadPosts(categoria === "todas" ? null : categoria));
    setCargando(false);
  };

  useEffect(() => {
    refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria]);

  const handleLike = async (post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, likedByMe: !p.likedByMe, totalLikes: p.totalLikes + (p.likedByMe ? -1 : 1) } : p
      )
    );
    await toggleLike(post.id, post.likedByMe);
  };

  const handleReportar = async (tipo, id) => {
    const motivo = window.prompt("¿Por qué querés reportar esto? (opcional)");
    if (motivo === null) return;
    await reportar(tipo, id, motivo);
    window.alert("Gracias, lo vamos a revisar.");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setCategoria("todas")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            categoria === "todas" ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
          }`}
        >
          Todas
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoria(c.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              categoria === c.id ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
        <button
          onClick={() => setMostrarComposer((v) => !v)}
          className="ml-auto text-sm bg-gradient-to-br from-rose-500 to-pink-400 text-white font-medium px-4 py-2 rounded-xl hover:opacity-95 transition-opacity"
        >
          + Compartir algo
        </button>
      </div>

      {mostrarComposer && (
        <ComposerPost
          onClose={() => setMostrarComposer(false)}
          onPosted={() => {
            setMostrarComposer(false);
            refrescar();
          }}
        />
      )}

      {cargando ? (
        <p className="text-sm text-gray-400 text-center py-8">Cargando el foro...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 shadow-sm text-center">
          <p className="text-sm text-gray-500">Todavía no hay nada por acá. ¡Compartí lo primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => {
            const cat = CATEGORIAS.find((c) => c.id === p.categoria);
            const abierto = postAbierto === p.id;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <span className="inline-block text-xs bg-rose-50 text-rose-600 rounded-full px-2 py-0.5 mb-1.5">
                      {cat?.icon} {cat?.label}
                    </span>
                    {p.titulo && <p className="text-sm font-semibold text-gray-800">{p.titulo}</p>}
                    <p className="text-xs text-gray-400">{p.nombreMostrado}</p>
                  </div>
                  <button
                    onClick={() => handleReportar("post", p.id)}
                    className="text-[10px] text-gray-300 hover:text-red-500 shrink-0"
                  >
                    Reportar
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{p.contenido}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(p)}
                    className={`flex items-center gap-1 text-sm ${p.likedByMe ? "text-rose-500" : "text-gray-400 hover:text-rose-400"}`}
                  >
                    {p.likedByMe ? "♥" : "♡"} {p.totalLikes || ""}
                  </button>
                  <button
                    onClick={() => setPostAbierto(abierto ? null : p.id)}
                    className="text-sm text-gray-400 hover:text-rose-500"
                  >
                    💬 {p.totalComentarios || 0} {p.totalComentarios === 1 ? "comentario" : "comentarios"}
                  </button>
                </div>

                {abierto && <Comentarios postId={p.id} onComentado={refrescar} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
