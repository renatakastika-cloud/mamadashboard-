import { supabase } from "../lib/supabaseClient";

export const CATEGORIAS = [
  { id: "general", label: "General", icon: "💬" },
  { id: "alguien_mas", label: "¿Alguien más?", icon: "🙋" },
  { id: "logros", label: "Logros", icon: "🎉" },
  { id: "preguntas", label: "Preguntas", icon: "❓" },
];

const ALIAS_ADJETIVOS = ["Curiosa", "Valiente", "Serena", "Radiante", "Fuerte", "Dulce", "Intrépida", "Luminosa"];

function generarAlias() {
  const adj = ALIAS_ADJETIVOS[Math.floor(Math.random() * ALIAS_ADJETIVOS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `Mamá ${adj} #${num}`;
}

export async function getMiId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

export async function asegurarPerfilPublico(nombre) {
  const miId = await getMiId();
  if (!miId) return;
  const { data } = await supabase.from("comunidad_perfiles").select("id").eq("id", miId).maybeSingle();
  if (!data) {
    await supabase.from("comunidad_perfiles").insert({ id: miId, nombre_publico: nombre || "Mamá" });
  }
}

export async function loadGrupos() {
  const { data, error } = await supabase.from("comunidad_grupos").select("*").order("orden");
  if (error) return [];
  return data;
}

export function calcularGrupoObjetivo(grupos, { semanaActual, esPostparto, semanaPostparto }) {
  const tipo = esPostparto ? "postparto" : "embarazo";
  const semana = esPostparto ? semanaPostparto : semanaActual;
  return (
    grupos.find((g) => g.tipo === tipo && semana >= g.semana_min && (g.semana_max == null || semana <= g.semana_max)) ||
    grupos.find((g) => g.tipo === tipo) ||
    null
  );
}

export async function unirseAGrupo(grupoId) {
  const miId = await getMiId();
  if (!miId) return null;
  const { data: existente } = await supabase
    .from("comunidad_grupo_miembros")
    .select("*")
    .eq("grupo_id", grupoId)
    .eq("user_id", miId)
    .maybeSingle();
  if (existente) return existente;
  const { data, error } = await supabase
    .from("comunidad_grupo_miembros")
    .insert({ grupo_id: grupoId, user_id: miId, alias: generarAlias() })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function resolverNombreMostrado(grupoId, userId, esAnonimo) {
  if (esAnonimo) {
    const { data } = await supabase
      .from("comunidad_grupo_miembros")
      .select("alias")
      .eq("grupo_id", grupoId)
      .eq("user_id", userId)
      .maybeSingle();
    return data?.alias || "Anónima";
  }
  const { data } = await supabase.from("comunidad_perfiles").select("nombre_publico").eq("id", userId).maybeSingle();
  return data?.nombre_publico || "Mamá";
}

export async function loadMensajes(grupoId) {
  const { data: mensajes, error } = await supabase
    .from("comunidad_mensajes")
    .select("*")
    .eq("grupo_id", grupoId)
    .order("created_at", { ascending: true });
  if (error || mensajes.length === 0) return [];

  const userIds = [...new Set(mensajes.map((m) => m.user_id))];
  const [{ data: perfiles }, { data: miembros }] = await Promise.all([
    supabase.from("comunidad_perfiles").select("id, nombre_publico").in("id", userIds),
    supabase.from("comunidad_grupo_miembros").select("user_id, alias").eq("grupo_id", grupoId).in("user_id", userIds),
  ]);

  const nombreMap = new Map((perfiles || []).map((p) => [p.id, p.nombre_publico]));
  const aliasMap = new Map((miembros || []).map((m) => [m.user_id, m.alias]));

  return mensajes.map((m) => ({
    ...m,
    nombreMostrado: m.es_anonimo ? aliasMap.get(m.user_id) || "Anónima" : nombreMap.get(m.user_id) || "Mamá",
  }));
}

export async function enviarMensaje(grupoId, contenido, esAnonimo) {
  const miId = await getMiId();
  if (!miId || !contenido.trim()) return;
  await supabase.from("comunidad_mensajes").insert({
    grupo_id: grupoId,
    user_id: miId,
    contenido: contenido.trim(),
    es_anonimo: !!esAnonimo,
  });
}

export function suscribirseAMensajes(grupoId, onNuevoMensaje) {
  const channel = supabase
    .channel(`comunidad_mensajes_${grupoId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "comunidad_mensajes", filter: `grupo_id=eq.${grupoId}` },
      (payload) => onNuevoMensaje(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function loadPosts(categoria) {
  const miId = await getMiId();

  let query = supabase
    .from("comunidad_posts")
    .select("*, likes:comunidad_post_likes(count), comentarios:comunidad_post_comentarios(count)")
    .order("created_at", { ascending: false });
  if (categoria) query = query.eq("categoria", categoria);

  const { data: posts, error } = await query;
  if (error || posts.length === 0) return [];

  const userIds = [...new Set(posts.map((p) => p.user_id))];
  const [{ data: perfiles }, { data: misLikes }] = await Promise.all([
    supabase.from("comunidad_perfiles").select("id, nombre_publico").in("id", userIds),
    miId
      ? supabase.from("comunidad_post_likes").select("post_id").eq("user_id", miId)
      : Promise.resolve({ data: [] }),
  ]);

  const nombreMap = new Map((perfiles || []).map((p) => [p.id, p.nombre_publico]));
  const likedSet = new Set((misLikes || []).map((l) => l.post_id));

  return posts.map((p) => ({
    ...p,
    nombreMostrado: p.es_anonimo ? "Anónima" : nombreMap.get(p.user_id) || "Mamá",
    totalLikes: p.likes?.[0]?.count || 0,
    totalComentarios: p.comentarios?.[0]?.count || 0,
    likedByMe: likedSet.has(p.id),
  }));
}

export async function crearPost({ titulo, contenido, categoria, esAnonimo }) {
  const miId = await getMiId();
  if (!miId || !contenido.trim()) return { ok: false };
  const { error } = await supabase.from("comunidad_posts").insert({
    user_id: miId,
    titulo: titulo?.trim() || null,
    contenido: contenido.trim(),
    categoria: categoria || "general",
    es_anonimo: !!esAnonimo,
  });
  return { ok: !error };
}

export async function loadComentarios(postId) {
  const { data: comentarios, error } = await supabase
    .from("comunidad_post_comentarios")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error || comentarios.length === 0) return [];

  const userIds = [...new Set(comentarios.map((c) => c.user_id))];
  const { data: perfiles } = await supabase.from("comunidad_perfiles").select("id, nombre_publico").in("id", userIds);
  const nombreMap = new Map((perfiles || []).map((p) => [p.id, p.nombre_publico]));

  return comentarios.map((c) => ({
    ...c,
    nombreMostrado: c.es_anonimo ? "Anónima" : nombreMap.get(c.user_id) || "Mamá",
  }));
}

export async function crearComentario(postId, contenido, esAnonimo) {
  const miId = await getMiId();
  if (!miId || !contenido.trim()) return { ok: false };
  const { error } = await supabase.from("comunidad_post_comentarios").insert({
    post_id: postId,
    user_id: miId,
    contenido: contenido.trim(),
    es_anonimo: !!esAnonimo,
  });
  return { ok: !error };
}

export async function toggleLike(postId, likedByMe) {
  const miId = await getMiId();
  if (!miId) return;
  if (likedByMe) {
    await supabase.from("comunidad_post_likes").delete().eq("post_id", postId).eq("user_id", miId);
  } else {
    await supabase.from("comunidad_post_likes").insert({ post_id: postId, user_id: miId });
  }
}

export async function reportar(tipo, referenciaId, motivo) {
  const miId = await getMiId();
  if (!miId) return;
  await supabase.from("comunidad_reportes").insert({
    tipo,
    referencia_id: referenciaId,
    reportado_por: miId,
    motivo: motivo || null,
  });
}
