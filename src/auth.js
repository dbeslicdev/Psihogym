import { useSyncExternalStore } from "react";

// Demo code is removed from production builds. Storage is never production authorization.
export const DEMO_ENABLED = import.meta.env.DEV;
const USERS = import.meta.env.DEV ? {
  admin: { password: "admin", ime: "Administrator", role: "admin", programi: "all" },
  demo: { password: "demo", ime: "Demo korisnik", role: "user", programi: ["centar-snage"] },
} : {};
const KEY = "psihogym_auth_v2";
const TTL = 30 * 60 * 1000;
const listeners = new Set();
let timer;
function readSession() {
  if (!DEMO_ENABLED) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY));
    if (!value || !Object.hasOwn(USERS, value.username) || !Number.isFinite(value.ts)
      || value.ts > Date.now() || Date.now() - value.ts >= TTL) return null;
    const { password, ...profile } = USERS[value.username];
    return { ...profile, username: value.username, expiresAt: value.ts + TTL };
  } catch { return null; }
}
let user = readSession();
function emit() { listeners.forEach((listener) => listener()); }
function scheduleExpiry() {
  clearTimeout(timer);
  if (user) timer = setTimeout(logout, Math.max(0, user.expiresAt - Date.now()));
}
scheduleExpiry();
export function getUser() { return user; }
export function isLoggedIn() { return !!user && user.expiresAt > Date.now(); }
export function useAuth() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, getUser);
}
export async function login(username, password) {
  if (!DEMO_ENABLED) throw new Error("Prijava još nije dostupna. Javi nam se putem kontakta.");
  const profile = Object.hasOwn(USERS, username) ? USERS[username] : null;
  if (!profile || profile.password !== password) return false;
  sessionStorage.setItem(KEY, JSON.stringify({ username, ts: Date.now() }));
  user = readSession();
  scheduleExpiry();
  emit();
  return true;
}
export function logout() {
  clearTimeout(timer);
  if (user) {
    // Private demo text is tab-scoped and removed on logout/expiry.
    const prefix = "psihogym_private_v1:" + user.username + ":";
    for (const key of Object.keys(sessionStorage)) if (key.startsWith(prefix)) sessionStorage.removeItem(key);
  }
  sessionStorage.removeItem(KEY);
  user = null;
  emit();
}
export function hasAccess(programId) {
  if (!isLoggedIn()) return false;
  if (user.programi === "all" || user.programi.includes(programId)) return true;
  try {
    const purchases = JSON.parse(sessionStorage.getItem("psihogym_purchases_v2:" + user.username));
    return Array.isArray(purchases) && purchases.includes(programId);
  } catch { return false; }
}
