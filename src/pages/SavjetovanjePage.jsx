import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { mitovi } from "../data.js";
import { SplitText, Curve, V4Shell } from "../v4/kit.jsx";
import useSectionEntrance from "../components/useSectionEntrance.js";
import useRefinedSections from "../components/useRefinedSections.js";
import "../v4.css";

/* SAVJETOVANJE — v4 "Utočište" jezik. Sekvenca valova:
   krem (subhero + timski rad) → sage-soft (važno je znati) →
   blush-soft (očekivanja vs realnost) → lavender-soft (mitovi) →
   lavanda (CTA). Boje/tipografija iz tokena (--ps-*). */

const ZNATI = [
  "Sve što kažeš ostaje između nas.",
  "Individualni rad namijenjen je osobama starijim od 18 godina.",
  "Jedan termin traje 45 minuta.",
  "Termin dogovaramo barem tjedan dana unaprijed, kako bismo oboje imali dovoljno vremena.",
  "Termin možeš otkazati najkasnije 24 sata prije početka. Kasnije otkazan termin naplaćuje se u punom iznosu.",
  "Plaćaš brzo i jednostavno, uplatom na račun.",
  "Susreti se održavaju putem Google Meeta.",
];

// Boje kuta oblačića, istim redom kao kartice tema na naslovnici.
const ZNATI_PAPER = ["var(--ps-mist)", "var(--ps-sage-bg)", "var(--ps-terra)", "var(--ps-terra)", "var(--ps-mist)", "var(--ps-sage-bg)", "var(--ps-terra)"];
const ZNATI_COLOR = ["lavender", "cream", "sage", "cream", "sage", "lavender", "cream"];

const OCEKIVANJA = ["plakanje", "kontinuirani oporavak", "još plakanja"];

const NIJE_ZA_TEBE = [
  "očekuješ da će netko drugi riješiti tvoje probleme umjesto tebe",
  "ne želiš razgovarati o svojim iskustvima, mislima i osjećajima",
  "dolaziš samo zato što te netko drugi šalje, a ti ne vidiš potrebu za razgovorom",
];

const REALNOST = [
  "izgradnja odnosa",
  "sagledavanje situacije iz druge perspektive",
  "usponi i padovi",
  "osjećaj zaglavljenosti u napretku",
  "i plač i smijeh",
  "učenje i primjena novih vještina",
];

export default function SavjetovanjePage() {
  const [openMit, setOpenMit] = useState(null);
  const closingRef = useRef(null);
  const znatiRef = useRef(null);
  const noIvana = useRef(null);
  useRefinedSections(noIvana, znatiRef); // kartice "Važno je znati" ulaze sa strane kao teme
  const closingReady = useSectionEntrance(closingRef, ".v4-cta__title", .85);

  return (
    <V4Shell className="marketing-page pg-playground pg-premium pg-counselling" data-editorial-waves>
      {/* ===== 1. SUBHERO — što je savjetovanje, slovo po slovo ===== */}
      <section className="on-hero" data-bg="#fbf5ec" data-stop>
        <span className="v4-label">INDIVIDUALNI RAD</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Razgovaramo o onome što te muči, brine ili zbunjuje i zajedno tražimo moguća rješenja.",
            },
          ]}
        />
      </section>

      {/* ===== 2. TIMSKI RAD — prose (krem) ===== */}
      <section className="on-prose reading-exit" data-bg="#fbf5ec" data-stop>
        <SplitText as="h2" className="on-prose__title" delay={0.1} segments={[{ text: "Ti i ja smo tim" }]} />
        <div className="on-prose__body" data-wave-content>
          <SplitText as="p" delay={0.15} stagger={0.0035} duration={0.28} segments={[{ text: "Tvoja želja za radom na sebi važan je dio procesa. Ja donosim znanje i iskustvo, a ti se najbolje poznaješ. Zajedno otkrivamo što ti je važno, postavljamo ciljeve i činimo smislene korake." }]} />
        </div>
      </section>

      {/* Practical information: the heading follows four reading blocks. */}
      {/* "Važno je znati": naslov na sredini, svaka tvrdnja u oblačiću kao kartice tema
          (obojeni kut, redni broj), po sadržaju od 26. 11. 2026. */}
      <Curve color="#e2ecf1" className="v4-podrucja pg-topics-scroll sv-znati" innerRef={znatiRef} consumeStart={0.95} data-stop>
        <SplitText as="h2" className="v4-podrucja__title pg-topics-heading" delay={0.1} segments={[{ text: "Važno je znati" }]} />
        <div className="v4-podrucja__chips">
          {ZNATI.map((text, i) => (
            <div
              className={`v4-chip v4-chip--${ZNATI_COLOR[i % ZNATI_COLOR.length]} v4-chip--c${i + 1} pg-topic--corner`}
              style={{ "--topic-paper": ZNATI_PAPER[i % ZNATI_PAPER.length] }}
              key={text}
            >
              <div className="v4-chip__inner">
                <span className="v4-chip__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="v4-chip__desc sv-znati__text">{text}</span>
              </div>
            </div>
          ))}
        </div>
      </Curve>

      {/* ===== 5. MITOVI — accordion (lavender-soft) ===== */}
      <Curve color="#e5ecdd" className="sv-section reading-exit" consumeStart={0.55} data-stop>
        <div className="sv-head">
          <SplitText as="h2" className="sv-h2" delay={0.1} segments={[{ text: "Što ljudi često misle, a nije tako" }]} />
        </div>
        <div className="sv-mitovi" data-wave-content>
          {mitovi.map((m, i) => {
            const isOpen = openMit === i;
            return (
              <div className={`sv-mit${isOpen ? " is-open" : ""}`} key={i}>
                <button
                  type="button"
                  className="sv-mit__trigger"
                  aria-expanded={isOpen}
                  aria-controls={`mit-panel-${i}`}
                  id={`mit-trigger-${i}`}
                  onClick={() => setOpenMit(isOpen ? null : i)}
                >
                  <SplitText as="span" stagger={0.0035} duration={0.28} segments={[{ text: m.mit }]} />
                  <span className="sv-mit__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 2v12M2 8h12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                <div className="sv-mit__body" id={`mit-panel-${i}`} aria-labelledby={`mit-trigger-${i}`} aria-hidden={!isOpen}>
                  <div className="sv-mit__inner">
                    <p>{m.istina}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Curve>

      <Curve color="#fbf5ec" className="sv-section sv-not-for reading-exit" consumeStart={0.55} data-stop>
        <div className="sv-not-for__layout" data-wave-content>
          <SplitText as="h2" className="sv-h2" segments={[{ text: "Individualni rad nije za tebe ako:" }]} />
          <div className="sv-not-for__body">
            {NIJE_ZA_TEBE.map(text => <SplitText key={text} as="p" stagger={0.0035} duration={0.28} segments={[{ text }]} />)}
          </div>
        </div>
      </Curve>

      {/* ===== 7. CTA — lavanda finale ===== */}
      <Curve color="#e4d9cd" className="v4-cta" innerRef={closingRef} data-center-wave consumeStart={0.55} data-stop>
        <SplitText as="h2" className="v4-cta__title" delay={0.1} active={closingReady} segments={[{ text: "Želiš napraviti prvi korak?" }]} />
        <div className="on-cta__row counselling-cta-sequence">
          <Link to="/kontakt" className="v4-btn">
            Dogovori termin
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
          <Link to="/o-meni" className="v4-btn v4-btn--ghost">
            Upoznaj me
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
        </div>
      </Curve>
    </V4Shell>
  );
}
