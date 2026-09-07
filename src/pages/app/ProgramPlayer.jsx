import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { programiById } from "../../data.js";
import { hasAccess, logout } from "../../auth.js";
import { getProgress, setProgress } from "../../progress.js";

/* ============================================================
   Player lekcije — čita program iz /app/program/:programId.
   Provjerava pristup (mock uloge) i pamti napredak u
   localStorage (nastavi gdje si stao/la). Video je placeholder
   do spajanja na Bunny Stream.
   ============================================================ */

const TABS = [
  { id: "pregled", label: "Pregled" },
  { id: "materijali", label: "Materijali" },
  { id: "biljeske", label: "Bilješke" },
  { id: "refleksija", label: "Refleksija" },
];

export default function ProgramPlayer() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const program = programiById[programId];

  // Nepoznat, prazan (uskoro) ili nedostupan program → natrag na portal
  const flat = useMemo(
    () => (program ? program.modules.flatMap((m) => m.lessons) : []),
    [program],
  );

  const [currentId, setCurrentId] = useState(() => {
    const { current } = getProgress(programId);
    return current || flat[0]?.id || null;
  });
  const [done, setDone] = useState(() => new Set(getProgress(programId).done));
  const [tab, setTab] = useState("pregled");
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState("");

  // Perzistiraj napredak na svaku promjenu
  useEffect(() => {
    if (!program) return;
    setProgress(programId, { done: [...done], current: currentId });
  }, [program, programId, done, currentId]);

  if (!program || program.status !== "active" || flat.length === 0) {
    return <Navigate to="/app" replace />;
  }
  if (!hasAccess(programId)) {
    return <Navigate to="/app" replace />;
  }

  const idx = flat.findIndex((l) => l.id === currentId);
  const current = flat[idx] || flat[0];
  const progressPct = Math.round((done.size / flat.length) * 100);
  const isDone = done.has(current.id);

  const toggleDone = () => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const saveNote = () => {
    const body = draft.trim();
    if (!body) return;
    setNotes((prev) => [{ id: `n${prev.length + 1}`, time: "upravo sada", body }, ...prev]);
    setDraft("");
  };

  const handleLogout = () => {
    logout();
    navigate("/programi");
  };

  return (
    <div className="player">
      <header className="player__topbar">
        <Link to="/app" className="player__back">← Moji programi</Link>
        <span className="player__program">{program.title}</span>
        <div className="player__progress">
          <div className="player__progress-bar">
            <span style={{ width: `${progressPct}%` }} />
          </div>
          <span className="player__progress-label">{progressPct}% završeno</span>
        </div>
        <button type="button" className="player__logout" onClick={handleLogout}>
          Odjava
        </button>
      </header>

      <div className="player__body">
        {/* ---------- Kurikulum ---------- */}
        <aside className="player__sidebar" data-lenis-prevent>
          {program.modules.map((m, mi) => (
            <div className="player__module" key={m.id}>
              <p className="player__module-title label">
                {String(mi + 1).padStart(2, "0")} — {m.title}
              </p>
              <ul>
                {m.lessons.map((l) => {
                  const cls = [
                    "player__lesson",
                    l.id === current.id ? "is-current" : "",
                    done.has(l.id) ? "is-done" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <li key={l.id}>
                      <button className={cls} onClick={() => setCurrentId(l.id)}>
                        <span className="player__lesson-status" aria-hidden="true">
                          {done.has(l.id) ? "✓" : ""}
                        </span>
                        <span className="player__lesson-name">{l.title}</span>
                        <span className="player__lesson-dur">{l.duration}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* ---------- Sadržaj lekcije ---------- */}
        <main className="player__main">
          <div className="player__video">
            <button className="player__video-play" aria-label="Pokreni video">▶</button>
            <p className="player__video-note">
              Video player — Bunny Stream HLS (placeholder)
            </p>
          </div>

          <div className="player__lesson-head">
            <h1 className="player__lesson-title">{current.title}</h1>
            <button
              className={`player__done-btn${isDone ? " is-done" : ""}`}
              onClick={toggleDone}
            >
              {isDone ? "✓ Završeno" : "Označi kao završeno"}
            </button>
          </div>

          <div className="player__nav">
            <button
              className="player__nav-btn"
              disabled={idx <= 0}
              onClick={() => setCurrentId(flat[idx - 1].id)}
            >
              ← Prethodna
            </button>
            <button
              className="player__nav-btn"
              disabled={idx === flat.length - 1}
              onClick={() => setCurrentId(flat[idx + 1].id)}
            >
              Sljedeća →
            </button>
          </div>

          <div className="player__tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`player__tab${tab === t.id ? " is-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "pregled" && (
            <section className="player__panel">
              <p>
                U ovoj lekciji učiš prepoznati svoje okidače — situacije, misli i
                tjelesne signale koji pokreću stare obrasce. Kad ih naučiš uočiti
                na vrijeme, dobivaš prostor za drugačiju reakciju.
              </p>
              <h3>Što ćeš naučiti</h3>
              <ul className="player__bullets">
                <li>Razliku između okidača, reakcije i obrasca</li>
                <li>Kako tijelo prvo signalizira da je okidač aktiviran</li>
                <li>Tri koraka za hvatanje okidača u trenutku</li>
              </ul>
            </section>
          )}

          {tab === "materijali" && (
            <section className="player__panel">
              {program.assets.length === 0 && (
                <p className="player__empty">Nema materijala za ovu lekciju.</p>
              )}
              {program.assets.map((a) => (
                <div className="player__asset" key={a.id}>
                  <span className="player__asset-kind">{a.kind}</span>
                  <span className="player__asset-name">{a.title}</span>
                  <button className="player__asset-dl">Preuzmi</button>
                </div>
              ))}
            </section>
          )}

          {tab === "biljeske" && (
            <section className="player__panel">
              <textarea
                className="kontakt-textarea player__note-input"
                rows={4}
                placeholder="Zapiši što ti je sjelo iz ove lekcije…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button className="btn btn--dark" onClick={saveNote}>
                Spremi bilješku
              </button>
              {notes.map((n) => (
                <div className="player__note" key={n.id}>
                  <time>{n.time}</time>
                  {n.body}
                </div>
              ))}
            </section>
          )}

          {tab === "refleksija" && (
            <section className="player__panel player__reflect">
              {program.reflection.map((q, i) => (
                <div key={i}>
                  <label htmlFor={`refl-${i}`}>
                    {i + 1}. {q}
                  </label>
                  <textarea
                    id={`refl-${i}`}
                    className="kontakt-textarea player__note-input"
                    rows={3}
                  />
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
