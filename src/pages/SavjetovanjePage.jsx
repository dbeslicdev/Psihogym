import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { mitovi } from "../data.js";
import { SplitText, Curve, V4Shell } from "../v4/kit.jsx";
import useSectionEntrance from "../components/useSectionEntrance.js";
import "../v4.css";

/* SAVJETOVANJE — v4 "Utočište" jezik. Sekvenca valova:
   krem (subhero + timski rad) → sage-soft (važno je znati) →
   blush-soft (očekivanja vs realnost) → lavender-soft (mitovi) →
   lavanda (CTA). Boje/tipografija iz tokena (--ps-*). */

const ZNATI = [
  "Sve što kažeš ostaje između nas.",
  "Savjetovanje je namijenjeno osobama starijim od 18 godina.",
  "Cijena jednog termina iznosi 65€.",
  "Jedan termin traje jedan školski sat.",
  "Termin dogovaramo barem tjedan dana unaprijed — da nitko ne bude u žurbi.",
  "Otkazan termin unutar 24 sata prije održavanja naplaćuje se kao da je održan.",
  "Plaćanje ide transakcijski, brzo i jednostavno.",
  "Susrete provodimo putem Google Meet aplikacije.",
];

const OCEKIVANJA = ["plakanje", "kontinuirani oporavak", "još plakanja"];

const NIJE_ZA_TEBE = [
  "Očekuješ da će netko drugi riješiti tvoje probleme umjesto tebe.",
  "Ne želiš razgovarati o svojim iskustvima, mislima i osjećajima.",
  "Dolaziš samo zato što te netko drugi šalje, a sam/a ne vidiš potrebu za razgovorom.",
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
  const closingReady = useSectionEntrance(closingRef, ".v4-cta__title", .85);

  return (
    <V4Shell className="marketing-page pg-playground pg-premium pg-counselling" data-editorial-waves>
      {/* ===== 1. SUBHERO — što je savjetovanje, slovo po slovo ===== */}
      <section className="on-hero" data-bg="#fbf5ec" data-stop>
        <span className="v4-label">SAVJETOVANJE</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Razgovaramo o onome što te muči, brine ili zbunjuje te zajedno istražujemo moguća rješenja.",
            },
          ]}
        />
      </section>

      {/* ===== 2. TIMSKI RAD — prose (krem) ===== */}
      <section className="on-prose reading-exit" data-bg="#fbf5ec" data-stop>
        <SplitText as="h2" className="on-prose__title" delay={0.1} segments={[{ text: "Savjetovanje je timski rad." }]} />
        <div className="on-prose__body" data-wave-content>
          <SplitText as="p" delay={0.15} stagger={0.0035} duration={0.28} segments={[{ text: "Tvoja želja za radom na sebi bitan je dio procesa. Mi donosimo znanje i iskustvo, a ti se najbolje poznaješ. Zajedno otkrivamo što ti je važno, postavljamo ciljeve i radimo smislene korake." }]} />
        </div>
      </section>

      {/* Practical information: the heading follows four reading blocks. */}
      <Curve color="#e2ecf1" className="sv-section sv-reading reading-exit" data-stop>
        <div className="sv-reading__layout" data-wave-content>
          <div className="sv-reading__heading">
            <SplitText as="h2" className="sv-h2" delay={0.1} segments={[{ text: "Važno je znati" }]} />
          </div>
          <div className="sv-reading__body">
            {[0, 2, 4, 6].map((start) => (
              <div className="sv-reading__pair" key={start}>
                {ZNATI.slice(start, start + 2).map((text, index) => (
                  <SplitText as="p" key={text} className={index === 0 ? "sv-reading__lead" : "sv-reading__detail"}
                    stagger={0.0035} duration={0.28} delay={0.05} segments={[{ text }]} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Curve>

      {/* ===== 5. MITOVI — accordion (lavender-soft) ===== */}
      <Curve color="#e5ecdd" className="sv-section reading-exit" consumeStart={0.55} data-stop>
        <div className="sv-head">
          <SplitText as="h2" className="sv-h2" delay={0.1} segments={[{ text: "Najčešći mitovi o savjetovanju" }]} />
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
          <SplitText as="h2" className="sv-h2" segments={[{ text: "Za tebe nije savjetovanje ako:" }]} />
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
            Kontakt
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
          <Link to="/o-nama" className="v4-btn v4-btn--ghost">
            O nama
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
        </div>
      </Curve>
    </V4Shell>
  );
}
