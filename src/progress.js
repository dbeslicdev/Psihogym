/* ============================================================
   Napredak po programu — trajno u localStorage (preživi
   zatvaranje taba, za razliku od sesije). Oblik po programu:
     { done: ["l1","l2"], current: "l4" }
   Kasnije se seli u bazu po korisniku.
   ============================================================ */

const KEY = "psihogym_progress";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getProgress(programId) {
  const p = readAll()[programId];
  return { done: p?.done ?? [], current: p?.current ?? null };
}

export function setProgress(programId, progress) {
  const all = readAll();
  all[programId] = progress;
  writeAll(all);
}

/** Postotak završenosti (0–100) na temelju broja lekcija. */
export function progressPct(programId, totalLessons) {
  if (!totalLessons) return 0;
  const { done } = getProgress(programId);
  return Math.round((done.length / totalLessons) * 100);
}
