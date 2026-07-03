import { supabase } from "../lib/supabaseClient";

function mapUser(user) {
  if (!user) return null;
  return { id: user.id, nombre: user.user_metadata?.nombre || "", email: user.email };
}

export async function signup({ nombre, email, password }) {
  if (!nombre?.trim() || !email?.trim() || !password) {
    return { ok: false, error: "Completá todos los campos." };
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { nombre: nombre.trim() } },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  if (!data.session) {
    return { ok: true, needsVerification: true, email: email.trim() };
  }
  return { ok: true, user: mapUser(data.user) };
}

export async function verifySignupCode({ email, code }) {
  if (!code?.trim()) {
    return { ok: false, error: "Ingresá el código." };
  }
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: "signup",
  });
  if (error) {
    return { ok: false, error: "Código inválido o vencido." };
  }
  return { ok: true, user: mapUser(data.user) };
}

export async function resendSignupCode({ email }) {
  const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
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
