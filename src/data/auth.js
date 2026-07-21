import { supabase } from "../lib/supabaseClient";

function mapUser(user) {
  if (!user) return null;
  return { id: user.id, nombre: user.user_metadata?.nombre || "", email: user.email };
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || "Ocurrió un error. Intentá de nuevo." };
  }
  return { ok: true, ...data };
}

export async function signup({ nombre, email, password }) {
  if (!nombre?.trim() || !email?.trim() || !password) {
    return { ok: false, error: "Completá todos los campos." };
  }
  const result = await postJson("/api/auth/send-verification-code", { email: email.trim() });
  if (!result.ok) {
    return result;
  }
  return { ok: true, needsVerification: true, email: email.trim() };
}

export async function verifySignupCode({ nombre, email, password, code }) {
  if (!code?.trim()) {
    return { ok: false, error: "Ingresá el código." };
  }
  const result = await postJson("/api/auth/verify-and-signup", {
    nombre,
    email: email.trim(),
    password,
    code: code.trim(),
  });
  if (!result.ok) {
    return result;
  }

  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    return { ok: false, error: "Cuenta creada. Iniciá sesión con tu email y contraseña." };
  }
  const { data } = await supabase.auth.getSession();
  return { ok: true, user: mapUser(data.session?.user) };
}

export async function resendSignupCode({ email }) {
  return postJson("/api/auth/send-verification-code", { email: email.trim() });
}

export async function login({ email, password }) {
  if (!email?.trim() || !password) {
    return { ok: false, error: "Completá email y contraseña." };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) {
    return { ok: false, error: "Email o contraseña incorrectos." };
  }
  return { ok: true, user: mapUser(data.user) };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return mapUser(data.session?.user);
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(mapUser(session?.user));
  });
  return () => data.subscription.unsubscribe();
}

export async function logout() {
  await supabase.auth.signOut();
}
