import { useEffect, useRef, useState } from "react";

/* Kalendar u stilu stranice (umjesto nativnog). Ikona je desno u polju,
   a kalendar se otvara ispod nje, poravnat uz desni rub polja.
   Vrijednost je ISO "YYYY-MM-DD" (kao nativni date input). */
const MONTHS = ["siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj",
  "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac"];
const DAYS = ["Po", "Ut", "Sr", "Če", "Pe", "Su", "Ne"];

const pad = (n) => String(n).padStart(2, "0");
const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const display = (s) => {
  if (!s) return "";
  const d = fromIso(s);
  return `${pad(d.getDate())}. ${pad(d.getMonth() + 1)}. ${d.getFullYear()}.`;
};

export default function KontaktDatePicker({ name, value, onChange, invalid, id, describedBy }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const base = value ? fromIso(value) : today;
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const d = value ? fromIso(value) : today;
      setView({ y: d.getFullYear(), m: d.getMonth() });
    }
    setOpen((o) => !o);
  };
  const shift = (delta) => setView(({ y, m }) => {
    const d = new Date(y, m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // ponedjeljak prvi
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const todayIso = toIso(today);

  return (
    <div className="kontakt-datepicker" ref={rootRef}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        ref={buttonRef}
        className={`kontakt-input kontakt-datepicker__field${invalid ? " is-invalid" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={toggle}
      >
        <span className={value ? "" : "kontakt-datepicker__placeholder"}>{value ? display(value) : "dd. mm. gggg."}</span>
        <svg className="kontakt-datepicker__icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>
      {open && (
        <div className="kontakt-calendar" role="dialog" aria-label="Odaberi datum">
          <div className="kontakt-calendar__head">
            <button type="button" className="kontakt-calendar__nav" onClick={() => shift(-1)} aria-label="Prethodni mjesec">‹</button>
            <span className="kontakt-calendar__title">{MONTHS[view.m]} {view.y}.</span>
            <button type="button" className="kontakt-calendar__nav" onClick={() => shift(1)} aria-label="Sljedeći mjesec">›</button>
          </div>
          <div className="kontakt-calendar__grid">
            {DAYS.map((d) => <span key={d} className="kontakt-calendar__dow">{d}</span>)}
            {cells.map((day, i) => {
              if (!day) return <span key={`e${i}`} />;
              const iso = toIso(new Date(view.y, view.m, day));
              return (
                <button
                  key={iso}
                  type="button"
                  className="kontakt-calendar__day"
                  data-selected={iso === value || undefined}
                  data-today={iso === todayIso || undefined}
                  aria-pressed={iso === value}
                  onClick={() => { onChange(iso); setOpen(false); buttonRef.current?.focus(); }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
