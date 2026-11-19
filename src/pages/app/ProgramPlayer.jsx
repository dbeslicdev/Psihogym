import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { addNote, api, deleteNote, editNote, listNotes, useAccount } from "../../account.js";
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
          <Notes programId={programId} program={program} lessonId={current.id} />
        </section>
      </div>
    </div>
  );
}

const NOTE_MAX = 5000;
const noteDate = new Intl.DateTimeFormat("hr-HR", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Zagreb" });

// Bilješke se spremaju uz račun (server); ovdje se samo prikazuju i uređuju.
function Notes({ programId, program, lessonId }) {
  const [notes, setNotes] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoadError("");
    listNotes(programId)
      .then((result) => { if (active) setNotes(result); })
      .catch((failure) => { if (active) setLoadError(failure.message); });
    return () => { active = false; };
  }, [programId, attempt]);

  // Promjena lekcije zatvara uređivanje i potvrdu brisanja.
  useEffect(() => { setEditing(null); setConfirming(null); setError(""); }, [lessonId]);

  const run = async (task) => {
    setBusy(true);
    setError("");
    try { await task(); return true; }
    catch (failure) { setError(failure.message); return false; }
    finally { setBusy(false); }
  };
  const draft = drafts[lessonId] || "";
  const mine = notes?.filter((note) => note.lessonId === lessonId) || [];

  const create = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    run(async () => {
      const note = await addNote(programId, lessonId, draft);
      setNotes((prev) => [...prev, note]);
      setDrafts((prev) => ({ ...prev, [lessonId]: "" }));
    });
  };
  const save = (event) => {
    event.preventDefault();
    run(async () => {
      const note = await editNote(programId, editing.id, editing.body);
      setNotes((prev) => prev.map((item) => item.id === note.id ? note : item));
      setEditing(null);
    });
  };
  const remove = (id) => run(async () => {
    await deleteNote(programId, id);
    setNotes((prev) => prev.filter((item) => item.id !== id));
    setConfirming(null);
  });
  const download = () => {
    const sections = program.modules.flatMap((module) => module.lessons).map((lesson) => {
      const items = notes.filter((note) => note.lessonId === lesson.id);
      return items.length ? lesson.title + "\n" + items.map((note) => "— " + noteDate.format(note.createdAt) + "\n" + note.body).join("\n\n") : null;
    }).filter(Boolean);
    const text = program.title + " — moje bilješke\n\n" + sections.join("\n\n\n") + "\n";
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "psihogym-biljeske-" + programId + ".txt" });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <details className="player__disclosure">
      <summary>Moje bilješke{mine.length > 0 && " (" + mine.length + ")"}</summary>
      <p id="note-help">Bilješke se spremaju uz tvoj račun; drugi korisnici ih ne vide. Možeš ih urediti, obrisati ili preuzeti.</p>
      {loadError ? <p className="player__error" role="alert">Bilješke se nisu učitale. {loadError} <button type="button" onClick={() => setAttempt(attempt + 1)}>Pokušaj ponovno</button></p> :
        notes === null ? <p role="status">Učitavanje bilješki…</p> : <>
          <ul className="player__notes">{mine.map((note) => (
            <li className="player__note" key={note.id}>
              {editing?.id === note.id ? (
                <form onSubmit={save}>
                  <label htmlFor={"edit-" + note.id} className="player__sr">Uredi bilješku</label>
                  <textarea id={"edit-" + note.id} className="kontakt-textarea player__note-input" rows={3} maxLength={NOTE_MAX} autoFocus
                    value={editing.body} onChange={(event) => setEditing({ ...editing, body: event.target.value })} />
                  <div className="player__note-actions">
                    <button type="submit" className="btn btn--dark" disabled={busy || !editing.body.trim()}>Spremi</button>
                    <button type="button" className="player__note-link" onClick={() => setEditing(null)}>Odustani</button>
                  </div>
                </form>
              ) : <>
                <p className="player__note-body">{note.body}</p>
                <div className="player__note-actions">
                  <span className="player__note-date">{noteDate.format(note.createdAt)}</span>
                  {confirming === note.id ? <>
                    <span role="status">Obrisati bilješku?</span>
                    <button type="button" className="player__note-link" disabled={busy} onClick={() => remove(note.id)}>Da, obriši</button>
                    <button type="button" className="player__note-link" onClick={() => setConfirming(null)}>Ne</button>
                  </> : <>
                    <button type="button" className="player__note-link" onClick={() => { setConfirming(null); setEditing({ id: note.id, body: note.body }); }}>Uredi</button>
                    <button type="button" className="player__note-link" onClick={() => { setEditing(null); setConfirming(note.id); }}>Obriši</button>
                  </>}
                </div>
              </>}
            </li>
          ))}</ul>
          <form onSubmit={create}>
            <label htmlFor="reading-note">Nova bilješka</label>
            <textarea id="reading-note" aria-describedby="note-help" className="kontakt-textarea player__note-input" rows={3} maxLength={NOTE_MAX}
              value={draft} onChange={(event) => setDrafts((prev) => ({ ...prev, [lessonId]: event.target.value }))} />
            <button type="submit" className="btn btn--dark" disabled={busy || !draft.trim()}>Dodaj bilješku</button>
          </form>
          {error && <p className="player__error" role="alert">{error}</p>}
          {notes.length > 0 && <button type="button" className="player__note-link player__note-download" onClick={download}>Preuzmi sve bilješke ovog programa (.txt)</button>}
        </>}
    </details>
  );
}
