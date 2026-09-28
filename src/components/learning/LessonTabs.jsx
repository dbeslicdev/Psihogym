const TABS = [
  { id: "pregled", label: "Pregled" },
  { id: "materijali", label: "Materijali" },
  { id: "biljeske", label: "Bilješke" },
  { id: "refleksija", label: "Refleksija" },
];
export default function LessonTabs({ active, onChange }) {
  const onKeyDown = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = TABS.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    onChange(TABS[next].id);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
  };
  return <div className="player__tabs" role="tablist" aria-label="Sadržaj lekcije">
    {TABS.map((tab, index) => <button key={tab.id} id={`tab-${tab.id}`} type="button" role="tab"
      aria-selected={active === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={active === tab.id ? 0 : -1}
      className={`player__tab${active === tab.id ? " is-active" : ""}`}
      onClick={() => onChange(tab.id)} onKeyDown={(event) => onKeyDown(event, index)}>{tab.label}</button>)}
  </div>;
}
