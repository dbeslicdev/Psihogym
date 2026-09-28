export default function Curriculum({ program, currentId, done, onSelect }) {
  return program.modules.map((module, index) => (
    <section className="player__module" key={module.id}>
      <h3 className="player__module-title label">{String(index + 1).padStart(2, "0")} — {module.title}</h3>
      <ul>{module.lessons.map((lesson) => (
        <li key={lesson.id}>
          <button type="button" className={`player__lesson${lesson.id === currentId ? " is-current" : ""}${done.has(lesson.id) ? " is-done" : ""}`}
            aria-current={lesson.id === currentId ? "step" : undefined}
            aria-label={`${lesson.title}, ${lesson.duration}${done.has(lesson.id) ? ", završeno" : ""}`}
            onClick={() => onSelect(lesson.id)}>
            <span className="player__lesson-status" aria-hidden="true">{done.has(lesson.id) ? "✓" : ""}</span>
            <span className="player__lesson-name">{lesson.title}</span>
            <span className="player__lesson-dur">{lesson.duration}</span>
          </button>
        </li>
      ))}</ul>
    </section>
  ));
}
