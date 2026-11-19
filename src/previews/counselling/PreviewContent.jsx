import { useId } from "react";
import { mitovi } from "../../data.js";

export const copy = {
  hero: {
    label: "SAVJETOVANJE",
    title: "Razgovaramo o onome što te muči, brine ili zbunjuje te zajedno istražujemo moguća rješenja.",
  },
  team: {
    title: "Savjetovanje je timski rad.",
    body: "Tvoja želja za radom na sebi bitan je dio procesa. Mi donosimo znanje i iskustvo, a ti se najbolje poznaješ. Zajedno otkrivamo što ti je važno, postavljamo ciljeve i radimo smislene korake.",
  },
  facts: {
    title: "Važno je znati",
    items: [
      {
        lead: "Sve što kažeš ostaje između nas.",
        detail: "Savjetovanje je namijenjeno osobama starijim od 18 godina.",
      },
      {
        lead: "Cijena jednog termina iznosi 65€.",
        detail: "Jedan termin traje jedan školski sat.",
      },
      {
        lead: "Termin dogovaramo barem tjedan dana unaprijed — da nitko ne bude u žurbi.",
        detail: "Otkazan termin unutar 24 sata prije održavanja naplaćuje se kao da je održan.",
      },
      {
        lead: "Plaćanje ide transakcijski, brzo i jednostavno.",
        detail: "Susrete provodimo putem Google Meet aplikacije.",
      },
    ],
  },
  myths: { title: "Najčešći mitovi o savjetovanju", items: mitovi },
  fit: {
    title: "Za tebe nije savjetovanje ako:",
    items: [
      "Očekuješ da će netko drugi riješiti tvoje probleme umjesto tebe.",
      "Ne želiš razgovarati o svojim iskustvima, mislima i osjećajima.",
      "Dolaziš samo zato što te netko drugi šalje, a sam/a ne vidiš potrebu za razgovorom.",
    ],
  },
  closing: {
    title: "Želiš napraviti prvi korak?",
    links: [
      { href: "/kontakt", label: "Kontakt" },
      { href: "/o-nama", label: "O nama" },
    ],
  },
};

export function Hero() {
  return <><span className="preview-eyebrow">{copy.hero.label}</span><h1>{copy.hero.title}</h1></>;
}

export function Team() {
  return <><h2>{copy.team.title}</h2><p>{copy.team.body}</p></>;
}

export function Facts() {
  return (
    <>
      <h2>{copy.facts.title}</h2>
      <div className="fact-list">
        {copy.facts.items.map(({ lead, detail }) => (
          <div className="fact-pair" key={lead}>
            <p className="fact-lead">{lead}</p>
            <p className="fact-detail">{detail}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function Myths() {
  const group = useId();
  return (
    <>
      <h2>{copy.myths.title}</h2>
      <div className="myth-list">
        {copy.myths.items.map(({ mit, istina }) => (
          <details key={mit} name={group}>
            <summary>
              <span className="myth-question">{mit}</span>
              <svg className="myth-icon" aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </summary>
            <p>{istina}</p>
          </details>
        ))}
      </div>
    </>
  );
}

export function Fit() {
  return (
    <>
      <h2>{copy.fit.title}</h2>
      <div className="fit-list">{copy.fit.items.map(text => <p key={text}>{text}</p>)}</div>
    </>
  );
}

export function Closing() {
  return (
    <>
      <h2>{copy.closing.title}</h2>
      <div className="closing-links">
        {copy.closing.links.map(({ href, label }, index) => (
          <a key={href} href={href} target="_top" className={index === 0 ? "v4-btn" : "v4-btn v4-btn--ghost"}>
            {label} <span aria-hidden="true" className="cta-arrow">↗</span>
          </a>
        ))}
      </div>
    </>
  );
}

export function JumpLinks() {
  return (
    <nav className="preview-jump-links" aria-label="Sadržaj stranice">
      <a href="#timski-rad">Timski rad</a>
      <a href="#vazno">{copy.facts.title}</a>
      <a href="#mitovi">Najčešći mitovi</a>
      <a href="#za-tebe">Za tebe nije savjetovanje ako</a>
      <a href="#kontakt">Kontakt</a>
    </nav>
  );
}
