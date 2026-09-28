import { getUser } from "./auth.js";
import { programiById } from "./data.js";
import { normalizeProgress, readObject, writeObject } from "./services/storage.js";
const keyFor = (username) => "psihogym_progress_v2:" + username;
const idsFor = (programId) => programiById[programId]?.modules.flatMap((m) => m.lessons.map((l) => l.id)) || [];
export function getProgress(programId) {
  const user = getUser();
  const value = user ? readObject(localStorage, keyFor(user.username))[programId] : null;
  return normalizeProgress(value, idsFor(programId));
}
export function setProgress(programId, value) {
  const user = getUser();
  if (!user) throw new Error("Prijavi se za spremanje napretka.");
  const key = keyFor(user.username);
  writeObject(localStorage, key, { ...readObject(localStorage, key), [programId]: normalizeProgress(value, idsFor(programId)) });
}
export function progressPct(programId, totalLessons) {
  return totalLessons ? Math.min(100, Math.round(getProgress(programId).done.length / totalLessons * 100)) : 0;
}
