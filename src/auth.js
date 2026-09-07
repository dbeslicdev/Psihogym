/* ============================================================
   Mock autentikacija — bez backenda. "Sesija" živi u
   sessionStorage (nestaje zatvaranjem taba) i ističe nakon
   30 min. Zamijeniti Supabase authom + RLS kasnije; ostatak
   UI-ja (guard, uloge, pristup programima) ostaje isti.

   Mock korisnici:
     admin / admin  → vidi sve programe
     demo  / demo   → vidi samo "Centar unutarnje snage"
   ============================================================ */

import { isPurchased } from "./cart.js";

const USERS = {
  admin: {
    password: "admin",
    ime: "Administrator",
    role: "admin",
    programi: "all",
  },
  demo: {
    password: "demo",
    ime: "Demo korisnik",
    role: "user",
    programi: ["centar-snage"],
  },
};

const KEY = "psihogym_auth";
const TTL = 30 * 60 * 1000; // 30 min

/** Mock mrežni poziv — vraća Promise s malom latencijom. */
export function login(username, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const u = USERS[username];
      if (u && u.password === password) {
        sessionStorage.setItem(KEY, JSON.stringify({ username, ts: Date.now() }));
        resolve(true);
      } else {
        resolve(false);
      }
    }, 600);
  });
}

export function logout() {
  sessionStorage.removeItem(KEY);
}

function readSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !USERS[s.username]) return null;
    if (Date.now() - s.ts > TTL) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}

export function isLoggedIn() {
  return readSession() !== null;
}

/** Trenutni korisnik (bez lozinke) ili null. */
export function getUser() {
  const s = readSession();
  if (!s) return null;
  const { password, ...rest } = USERS[s.username];
  return { username: s.username, ...rest };
}

/** Ima li prijavljeni korisnik pristup danom programu —
    kroz ulogu ili kroz (mock) kupnju. */
export function hasAccess(programId) {
  const u = getUser();
  if (!u) return false;
  if (u.programi === "all" || u.programi.includes(programId)) return true;
  return isPurchased(programId);
}
