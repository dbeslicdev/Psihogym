import { useState } from "react";
import { Link } from "react-router-dom";
import { mitovi } from "../data.js";
import { SplitText, Curve, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

/* SAVJETOVANJE — v4 "Utočište" jezik. Sekvenca valova:
   krem (subhero + timski rad) → sage-soft (važno je znati) →
   blush-soft (očekivanja vs realnost) → lavender-soft (mitovi) →
   lavanda (CTA). Boje/tipografija iz tokena (--ps-*). */

const ZNATI = [
  "Jedan termin traje jedan školski sat.",
  "Sve što kažeš ostaje između nas.",
  "Termin dogovaramo barem tjedan dana unaprijed — da nitko ne bude u žurbi.",
  "Otkazan termin unutar 24 sata prije održavanja naplaćuje se kao da je održan.",
  "Plaćanje ide transakcijski, brzo i jednostavno.",
  "Savjetovanje je namijenjeno osobama starijim od 18 godina.",
  "Susrete provodimo putem Google Meet aplikacije.",
];

const OCEKIVANJA = ["plakanje", "kontinuirani oporavak", "još plakanja"];

const REALNOST = [
  "izgradnja odnosa",
  "sagledavanje situacija iz druge perspektive",
  "usponi i padovi",
  "osjećaj zaglavljenosti u napretku",
  "susreti na kojima ne znaš o čemu bi točno pričao/la",
  "i plač i smijeh",
  "učenje i primjena novih vještina",
];

export default function SavjetovanjePage() {
  const [openMit, setOpenMit] = useState(null);

  return (
    <V4Shell>
      {/* ===== 1. SUBHERO — što je savjetovanje, slovo po slovo ===== */}
      <section className="on-hero" data-bg="#faf6f0">
        <span className="v4-label">( savjetovanje )</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Savjetovanje je oblik profesionalne psihosocijalne podrške koja ti pomaže razviti vještine za nošenje s različitim životnim izazovima.",
            },
          ]}
        />
      </section>

      {/* ===== 2. TIMSKI RAD — prose (krem) ===== */}
      <section className="on-prose" data-bg="#faf6f0">
        <h2 className="on-prose__title reveal">
          Savjetovanje je <em>timski rad.</em>
        </h2>
        <div className="on-prose__body reveal" data-delay="1">
          <p>
            Tvoja želja za radom na sebi je izuzetno važna. Iako donosim svoje
            iskustvo i znanje, ti se ipak najbolje poznaješ. Zajedno postavljamo
            ciljeve, pratimo napredak i — ako nešto ne funkcionira —
            prilagođavamo plan.
          </p>
        </div>
      </section>

      {/* ===== 3. VAŽNO JE ZNATI — prvi VAL (sage-soft) ===== */}
      <Curve color="#dde5d8" className="sv-section">
        <div className="sv-head">
          <span className="v4-label">( dobro je znati )</span>
          <h2 className="sv-h2 reveal">
            Važno je <em>znati</em>
          </h2>
        </div>
        <ul className="sv-know reveal" data-delay="1">
          {ZNATI.map((t, i) => (
            <li key={i}>
              <span className="sv-know__n">{String(i + 1).padStart(2, "0")}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Curve>

      {/* ===== 4. OČEKIVANJA vs REALNOST — (blush-soft) ===== */}
      <Curve color="#f9eae8" className="sv-section">
        <div className="sv-head">
          <span className="v4-label">( iskreno )</span>
          <h2 className="sv-h2 reveal">
            Česta očekivanja <em>vs. realnost</em>
          </h2>
        </div>
        <div className="sv-vs reveal" data-delay="1">
          <div className="sv-vs__card sv-vs__card--myth">
            <h3 className="sv-vs__title">Česta očekivanja</h3>
            <ul>
              {OCEKIVANJA.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="sv-vs__card sv-vs__card--real">
            <h3 className="sv-vs__title">Realnost</h3>
            <ul>
              {REALNOST.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </Curve>

      {/* ===== 5. MITOVI — accordion (lavender-soft) ===== */}
      <Curve color="#e4e0f4" className="sv-section">
        <div className="sv-head">
          <span className="v4-label">( provjeri se )</span>
          <h2 className="sv-h2 reveal">Najčešći mitovi o savjetovanju</h2>
        </div>
        <div className="sv-mitovi reveal" data-delay="1">
          {mitovi.map((m, i) => {
            const isOpen = openMit === i;
            return (
              <div className={`sv-mit${isOpen ? " is-open" : ""}`} key={i}>
                <button
                  type="button"
                  className="sv-mit__trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenMit(isOpen ? null : i)}
                >
                  <span>{m.mit}</span>
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
                <div className="sv-mit__body">
                  <div className="sv-mit__inner">
                    <p>{m.istina}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Curve>

      {/* ===== 6. CTA — lavanda finale ===== */}
      <Curve color="#c9c3e6" className="v4-cta">
        <h2 className="v4-cta__title">
          Želiš napraviti <em>prvi korak?</em>
        </h2>
        <p className="v4-cta__sub">
          Javi se — dogovorimo prvi termin, tvojim tempom.
        </p>
        <div className="on-cta__row">
          <Link to="/kontakt" className="v4-btn">
            Kontakt
          </Link>
          <Link to="/o-nama" className="v4-btn v4-btn--ghost">
            O nama
          </Link>
        </div>
      </Curve>
    </V4Shell>
  );
}
