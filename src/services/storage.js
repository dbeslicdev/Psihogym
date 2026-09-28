/** Storage failures propagate: callers must not report failed writes as saved. */
export function readObject(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
export function writeObject(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}
export function normalizeProgress(value, lessonIds) {
  const valid = new Set(lessonIds);
  return {
    done: [...new Set(Array.isArray(value?.done) ? value.done.filter((id) => valid.has(id)) : [])],
    current: valid.has(value?.current) ? value.current : null,
  };
}

/** Explicit repository boundary. Production must supply an authenticated server adapter. */
export function createDemoWorkspaceRepository(storage, userId, programId) {
  if (!userId || !programId) throw new Error("Nedostaje korisnik ili program.");
  const key = `psihogym_private_v1:${userId}:${programId}`;
  return {
    read() { return readObject(storage, key); },
    save(workspace) { writeObject(storage, key, workspace); },
  };
}
