const USERS_KEY = "mama-dashboard:users";
const SESSION_KEY = "mama-dashboard:session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signup({ nombre, email, password }) {
  if (!nombre?.trim() || !email?.trim() || !password) {
    return { ok: false, error: "Completá todos los campos." };
  }
  const users = loadUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { ok: false, error: "Ya existe una cuenta con ese email." };
  }
  const user = { nombre: nombre.trim(), email: email.trim(), password };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ nombre: user.nombre, email: user.email }));
  return { ok: true, user: { nombre: user.nombre, email: user.email } };
}

export function login({ email, password }) {
  if (!email?.trim() || !password) {
    return { ok: false, error: "Completá email y contraseña." };
  }
  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) {
    return { ok: false, error: "Email o contraseña incorrectos." };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ nombre: user.nombre, email: user.email }));
  return { ok: true, user: { nombre: user.nombre, email: user.email } };
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
