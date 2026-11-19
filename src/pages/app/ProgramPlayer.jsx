import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { api, useAccount } from "../../account.js";
import { logout } from "../../auth.js";
import { getProgress, setProgress } from "../../progress.js";
import "./program-reader.css";

const CONTENT_TYPES = {
  video: "Opis videolekcije",
  reflection: "Samorefleksija",
  bonus: "Bonus sadržaj",
};

export default function ProgramPlayer() {
  const { programId } = useParams();
  const { user, purchases } = useAccount();
  if (!purchases.some((purchase) => purchase.programId === programId)) {
    return <Navigate to="/app" replace />;
  }
  return <LoadProgram key={user.id + "/" + programId} programId={programId} />;
}

function LoadProgram({ programId }) {
  const [program, setProgram] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    api("/programs/" + encodeURIComponent(programId) + "/curriculum", undefined, "GET")
      .then((result) => { if (active) setProgram(result); })
      .catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [programId, attempt]);

  if (!program) {
    return <div className="player player__loading">
      <Link to="/app">← Moji programi</Link>
      {error ? <><p role="alert">{error}</p><button className="btn btn--dark" onClick={() => setAttempt(attempt + 1)}>Pokušaj ponovno</button></> :
        <p role="status">Učitavanje programa…</p>}
    </div>;
  }
  return <CourseReader programId={programId} program={program} />;
}

function CourseReader({ program, programId }) {
  const navigate = useNavigate();
  const entries = program.modules.flatMap((module) => module.lessons);
  const [progress, setLocalProgress] = useState(() => {
    const stored = getProgress(programId);
    const validIds = new Set(entries.map((entry) => entry.id));
    return {
      current: validIds.has(stored.current) ? stored.current : entries[0].id,
      done: stored.done.filter((id) => validIds.has(id)),
    };
  });
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [notes, setNotes] = useState({});
  const [drafts, setDrafts] = useState({});
  const [saveError, setSaveError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [retry, setRetry] = useState(0);
  const title = useRef(null);
  const opened = useRef(progress);

  useEffect(() => {
    // Samo otvaranje programa ne sprema napredak (inače dashboard nudi "Nastavi" bez čitanja).
    if (progress === opened.current && retry === 0) return;
    let active = true;
    // Queue each selection, including a quick A → B → A while B is still saving.
    setProgress(programId, progress)
      .then(() => { if (active) setSaveError(""); })
      .catch((failure) => { if (active) setSaveError(failure.message); });
    return () => { active = false; };
  }, [programId, progress, retry]);

  const index = entries.findIndex((entry) => entry.id === progress.current);
  const current = entries[index];
  const module = program.modules.find((item) => item.lessons.some((entry) => entry.id === current.id));
  const isRead = progress.done.includes(current.id);
  const percent = Math.round(100 * progress.done.length / entries.length);

  const selectEntry = (id) => {
    setLocalProgress((prev) => ({ ...prev, current: id }));
    setOutlineOpen(false);
    // Keyboard and touch users return to the selected reading after using the outline.
    requestAnimationFrame(() => {
      if (title.current) {
        title.current.focus({ preventScroll: true });
        title.current.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
  };

  const toggleRead = () => {
    setLocalProgress((prev) => ({
      ...prev, done: prev.done.includes(current.id) ? prev.done.filter((id) => id !== current.id) : [...prev.done, current.id],
    }));
  };
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/programi");
    } catch {
      setLogoutError("Odjava nije uspjela. Pokušaj ponovno.");
    }
  };
  const saveNote = (event) => {
    event.preventDefault();
    const body = drafts[current.id]?.trim();
    if (!body) return;
    setNotes((prev) => ({ ...prev, [current.id]: [...(prev[current.id] || []), body] }));
    setDrafts((prev) => ({ ...prev, [current.id]: "" }));
  };

  return (
    <div className="player">
      <header className="player__topbar">
        <Link to="/app" className="player__back">← Moji programi</Link>
        <span className="player__program">{program.title}</span>
        <div className="player__progress">
          <div className="player__progress-bar" aria-hidden="true"><span style={{ width: percent + "%" }} /></div>
          <span className="player__progress-label">{percent}% pročitano</span>
        </div>
        <button type="button" className="player__logout" onClick={handleLogout}>Odjava</button>
      </header>

      <div className="player__body">
        <nav className="player__sidebar" aria-label="Sadržaj programa">
          <button type="button" className="player__outline-toggle" aria-expanded={outlineOpen} aria-controls="course-outline"
            onClick={() => setOutlineOpen(!outlineOpen)}>Sadržaj programa <span aria-hidden="true">{outlineOpen ? "−" : "+"}</span></button>
          <div className={"player__outline" + (outlineOpen ? " is-open" : "")} id="course-outline" data-lenis-prevent>
            {program.modules.map((item, mi) => (
              <section className="player__module" key={item.id}>
                <h2 className="player__module-title">Modul {mi + 1} · {item.title}</h2>
                <ul>{item.lessons.map((entry) => (
                  <li key={entry.id}>
                    <button type="button" aria-current={entry.id === current.id ? "step" : undefined}
                      className={["player__lesson", entry.id === current.id && "is-current", progress.done.includes(entry.id) && "is-done"].filter(Boolean).join(" ")}
                      onClick={() => selectEntry(entry.id)}>
                      <span className="player__lesson-status" aria-hidden="true">{progress.done.includes(entry.id) && "✓"}</span>
                      <span className="player__lesson-name">{entry.title}</span>
                      {progress.done.includes(entry.id) && <span className="player__sr">Pročitano</span>}
                    </button>
                  </li>))}</ul>
              </section>
            ))}
          </div>
        </nav>

        <section className="player__main" aria-labelledby="reading-title">
          <p className="player__eyebrow">{module.title} · {CONTENT_TYPES[current.type]}</p>
          <h1 id="reading-title" ref={title} tabIndex={-1} className="player__lesson-title">{current.title}</h1>
          <p className="player__reading-copy">{current.description}</p>
          {current.type !== "reflection" && <p className="player__availability">Video još nije dostupan.</p>}
          <div className="player__reading-controls">
            <button type="button" className={"player__done-btn" + (isRead ? " is-done" : "")} aria-pressed={isRead} onClick={toggleRead}>
              {isRead ? "✓ Pročitano" : "Označi kao pročitano"}
            </button>
            <div className="player__nav">
              <button type="button" className="player__nav-btn" disabled={index === 0} onClick={() => selectEntry(entries[index - 1].id)}>← Prethodna</button>
              <button type="button" className="player__nav-btn" disabled={index === entries.length - 1} onClick={() => selectEntry(entries[index + 1].id)}>Sljedeća →</button>
            </div>
          </div>
          {saveError && <p className="player__error" role="alert">Spremanje napretka nije uspjelo. {saveError} <button type="button" onClick={() => setRetry(retry + 1)}>Pokušaj ponovno</button></p>}
          {logoutError && <p className="player__error" role="alert">{logoutError}</p>}

          <details className="player__disclosure">
            <summary>O ovom modulu</summary>
            <p>{module.description}</p>
          </details>
          <details className="player__disclosure">
            <summary>{program.introduction}</summary>
            <p>{program.description}</p>
          </details>
          <details className="player__disclosure">
            <summary>Materijali programa</summary>
            <p>{program.workbook.title}</p>
            <p>Broj stranica: {program.workbook.pages} · Broj vježbi: {program.workbook.exercises}</p>
            <p>{program.bibliography}</p>
            <p className="player__availability">Datoteke još nisu dostupne za preuzimanje.</p>
          </details>
          <details className="player__disclosure">
            <summary>Moje bilješke{notes[current.id]?.length > 0 && " (" + notes[current.id].length + ")"}</summary>
            <p id="note-help">Bilješke za ovu stavku vidljive su dok je program otvoren. Zatvaranjem programa brišu se.</p>
            <form onSubmit={saveNote}>
              <label htmlFor="reading-note">Nova bilješka</label>
              <textarea id="reading-note" aria-describedby="note-help" className="kontakt-textarea player__note-input" rows={3}
                value={drafts[current.id] || ""} onChange={(event) => setDrafts((prev) => ({ ...prev, [current.id]: event.target.value }))}/>
              <button type="submit" className="btn btn--dark" disabled={!drafts[current.id]?.trim()}>Dodaj bilješku</button>
            </form>
            <ul>{notes[current.id]?.map((note, i) => <li className="player__note" key={i}>{note}</li>)}</ul>
          </details>
        </section>
      </div>
    </div>
  );
}
