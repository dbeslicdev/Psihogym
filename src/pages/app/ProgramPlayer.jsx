import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { programiById } from "../../data.js";
import { getUser, hasAccess, logout } from "../../auth.js";
import { getProgress, setProgress } from "../../progress.js";
import { createDemoWorkspaceRepository } from "../../services/storage.js";
import Curriculum from "../../components/learning/Curriculum.jsx";
import LessonTabs from "../../components/learning/LessonTabs.jsx";
import Modal from "../../components/Modal.jsx";

export default function ProgramPlayer() {
  const { programId } = useParams();
  const program = programiById[programId];
  if (!program || program.status !== "active" || !hasAccess(programId)) return <Navigate to="/app" replace />;
  return <Player key={programId + getUser().username} program={program} />;
}

function Player({ program }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const flat = useMemo(() => program.modules.flatMap((module) => module.lessons), [program]);
  const initial = useMemo(() => getProgress(program.id), [program.id]);
  const requested = params.get("lekcija") || initial.current;
  const current = flat.find((lesson) => lesson.id === requested) || flat[0];
  const index = flat.indexOf(current);
  const [done, setDone] = useState(() => new Set(initial.done));
  const [tab, setTab] = useState("pregled");
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const titleRef = useRef(null);
  const repository = useMemo(() => createDemoWorkspaceRepository(sessionStorage, getUser().username, program.id), [program.id]);
  const [workspace, setWorkspace] = useState(() => repository.read());
  const entry = workspace[current.id] || {};
  const notes = Array.isArray(entry.notes) ? entry.notes.filter((note) => typeof note?.body === "string") : [];
  const draft = typeof entry.draft === "string" ? entry.draft : "";
  const answers = Array.isArray(entry.answers) ? entry.answers : [];
  const pct = Math.round(done.size / flat.length * 100);

  useEffect(() => {
    if (params.get("lekcija") !== current.id) setParams({ lekcija: current.id }, { replace: true });
  }, [current.id, params, setParams]);
  useEffect(() => {
    try {
      setProgress(program.id, { done: [...done], current: current.id });
      setProgressError("");
    } catch { setProgressError("Napredak nije spremljen. Omogući pohranu u pregledniku i pokušaj ponovno."); }
  }, [program.id, done, current.id]);
  useEffect(() => {
    if (!saveError) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveError]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 64.001rem)");
    const close = () => { if (media.matches) setCurriculumOpen(false); };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);

  const persist = (next) => {
    setWorkspace(next);
    try { repository.save(next); setSaveError(""); setSaved(true); }
    catch { setSaveError("Zapis nije spremljen. Tvoj unos ostaje na ovoj stranici; pokušaj ponovno prije izlaska."); setSaved(false); }
  };
  const updateEntry = (patch) => persist({ ...workspace, [current.id]: { ...entry, ...patch } });
  const selectLesson = (id) => {
    setParams({ lekcija: id });
    setCurriculumOpen(false);
    setSaved(false);
    requestAnimationFrame(() => titleRef.current?.focus());
  };
  const toggleDone = () => setDone((previous) => {
    const next = new Set(previous);
    if (next.has(current.id)) next.delete(current.id); else next.add(current.id);
    return next;
  });
  const saveNote = () => {
    if (!draft.trim()) return;
    updateEntry({ draft: "", notes: [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), body: draft.trim() }, ...notes] });
  };
  const curriculum = <Curriculum program={program} currentId={current.id} done={done} onSelect={selectLesson} />;
  const panelProps = (id) => ({ id: "panel-" + id, role: "tabpanel", "aria-labelledby": "tab-" + id, hidden: tab !== id, tabIndex: 0 });

  return <div className="player">
    <header className="player__topbar">
      <Link to="/app" className="player__back">← Moji programi</Link>
      <span className="player__program" title={program.title}>{program.title}</span>
      <div className="player__progress">
        <progress className="player__progress-native" value={pct} max="100" aria-label="Završenost programa" />
        <span className="player__progress-label">{pct}% završeno</span>
      </div>
      <button type="button" className="player__logout" onClick={() => { logout(); navigate("/programi"); }}>Odjava</button>
    </header>
    <div className="player__mobile-tools">
      <button type="button" className="btn btn--dark" aria-haspopup="dialog" aria-expanded={curriculumOpen} onClick={() => setCurriculumOpen(true)}>Sadržaj programa</button>
      <span>Lekcija {index + 1} od {flat.length}</span>
    </div>
    <Modal open={curriculumOpen} onClose={() => setCurriculumOpen(false)} title="Sadržaj programa" className="player">{curriculum}</Modal>
    <div className="player__body">
      <aside className="player__sidebar" aria-label="Sadržaj programa" data-lenis-prevent>{curriculum}</aside>
      <div className="player__main">
        <div className="player__video" role="region" aria-label="Video lekcije">
          <span className="player__video-play" aria-hidden="true">▶</span>
          <p className="player__video-note">Video ove lekcije još nije dostupan.</p>
        </div>
        <div className="player__lesson-head">
          <h1 ref={titleRef} tabIndex={-1} className="player__lesson-title">{current.title}</h1>
          <button type="button" className={"player__done-btn" + (done.has(current.id) ? " is-done" : "")} aria-pressed={done.has(current.id)} onClick={toggleDone}>
            {done.has(current.id) ? "✓ Završeno" : "Označi kao završeno"}
          </button>
        </div>
        {progressError && <p className="error-message" role="alert">{progressError}</p>}
        <nav className="player__nav" aria-label="Navigacija lekcija">
          <button type="button" className="player__nav-btn" disabled={index === 0} onClick={() => selectLesson(flat[index - 1].id)}>← Prethodna</button>
          <button type="button" className="player__nav-btn" disabled={index === flat.length - 1} onClick={() => selectLesson(flat[index + 1].id)}>Sljedeća →</button>
        </nav>
        <LessonTabs active={tab} onChange={setTab} />
        <section className="player__panel" {...panelProps("pregled")}>
          <h2>{current.title}</h2>
          <p>{current.description || "Opis ove lekcije je u pripremi."}</p>
          <p>Trajanje: {current.duration} · Lekcija {index + 1} od {flat.length}</p>
        </section>
        <section className="player__panel" {...panelProps("materijali")}>
          <h2>Materijali programa</h2>
          <p>Preuzimanja će biti dostupna nakon objave materijala.</p>
          {program.assets.map((asset) => <div className="player__asset" key={asset.id}>
            <span className="player__asset-kind">{asset.kind}</span>
            <span className="player__asset-name">{asset.title}</span>
            <span className="player__asset-dl">U pripremi</span>
          </div>)}
        </section>
        <section className="player__panel" {...panelProps("biljeske")}>
          <label htmlFor="lesson-note">Bilješka uz lekciju „{current.title}”</label>
          <textarea id="lesson-note" className="kontakt-textarea player__note-input" rows={4} maxLength={10000}
            placeholder="Zapiši svoju misao…" value={draft} onChange={(event) => updateEntry({ draft: event.target.value })} />
          <button type="button" className="btn btn--dark" disabled={!draft.trim()} onClick={saveNote}>Spremi bilješku</button>
          {notes.map((note) => <article className="player__note" key={note.id}>
            <time dateTime={note.createdAt}>{note.createdAt ? new Date(note.createdAt).toLocaleString("hr-HR") : "Bilješka"}</time>
            <p>{note.body}</p>
          </article>)}
        </section>
        <section className="player__panel player__reflect" {...panelProps("refleksija")}>
          <p>Osvrni se na ovu lekciju kroz pitanja programa.</p>
          {program.reflection.map((question, i) => <div key={i}>
            <label htmlFor={"refl-" + i}>{i + 1}. {question}</label>
            <textarea id={"refl-" + i} className="kontakt-textarea player__note-input" rows={3} maxLength={10000}
              value={typeof answers[i] === "string" ? answers[i] : ""} onChange={(event) => {
                const next = [...answers]; next[i] = event.target.value; updateEntry({ answers: next });
              }} />
          </div>)}
        </section>
        {(tab === "biljeske" || tab === "refleksija") && <p className="status-message">Demo: zapisi se čuvaju u ovom tabu do odjave ili zatvaranja. Koristi probni tekst.</p>}
        <p role="status" className="status-message">{saved && !saveError ? "Spremljeno u ovom tabu." : ""}</p>
        {saveError && <div role="alert" className="error-message"><p>{saveError}</p><button type="button" onClick={() => persist(workspace)}>Pokušaj ponovno</button></div>}
      </div>
    </div>
  </div>;
}
