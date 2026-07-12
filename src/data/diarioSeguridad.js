const SALT_KEY = "mama-dashboard:diario-salt";
const VERIFICADOR_KEY = "mama-dashboard:diario-verificador";
const TEXTO_VERIFICACION = "mama-app-diario-ok";

function bufferABase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ABuffer(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

async function derivarClave(password, saltB64) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: base64ABuffer(saltB64), iterations: 100000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function tienePassword() {
  return Boolean(localStorage.getItem(SALT_KEY) && localStorage.getItem(VERIFICADOR_KEY));
}

export async function configurarPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltB64 = bufferABase64(salt);
  const clave = await derivarClave(password, saltB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cifrado = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    clave,
    new TextEncoder().encode(TEXTO_VERIFICACION)
  );
  localStorage.setItem(SALT_KEY, saltB64);
  localStorage.setItem(
    VERIFICADOR_KEY,
    JSON.stringify({ iv: bufferABase64(iv), data: bufferABase64(cifrado) })
  );
}

export async function verificarPassword(password) {
  if (!tienePassword()) return false;
  try {
    const saltB64 = localStorage.getItem(SALT_KEY);
    const clave = await derivarClave(password, saltB64);
    const { iv, data } = JSON.parse(localStorage.getItem(VERIFICADOR_KEY));
    const plano = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ABuffer(iv) },
      clave,
      base64ABuffer(data)
    );
    return new TextDecoder().decode(plano) === TEXTO_VERIFICACION;
  } catch {
    return false;
  }
}

// La clave derivada solo vive en memoria mientras dura la pestaña: se pierde
// al recargar, así el diario vuelve a quedar bloqueado.
let claveEnMemoria = null;

export function diarioDesbloqueado() {
  return Boolean(claveEnMemoria);
}

export function bloquearDiario() {
  claveEnMemoria = null;
}

export async function desbloquearDiario(password) {
  const ok = await verificarPassword(password);
  if (!ok) return false;
  claveEnMemoria = await derivarClave(password, localStorage.getItem(SALT_KEY));
  return true;
}

export async function cifrarConClave(texto) {
  if (!claveEnMemoria) throw new Error("El diario está bloqueado");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    claveEnMemoria,
    new TextEncoder().encode(texto || "")
  );
  return { iv: bufferABase64(iv), data: bufferABase64(data) };
}

export async function descifrarConClave(cifrado) {
  if (!claveEnMemoria || !cifrado) return "";
  try {
    const plano = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ABuffer(cifrado.iv) },
      claveEnMemoria,
      base64ABuffer(cifrado.data)
    );
    return new TextDecoder().decode(plano);
  } catch {
    return "⚠️ No se pudo desbloquear esta entrada.";
  }
}
