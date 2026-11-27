import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { podrucja, iskustva, programi, stats } from "../data.js";
import ProgramPreviewCard from "../components/ProgramPreviewCard.jsx";
import useRefinedSections from "../components/useRefinedSections.js";
import useProgramRail from "../components/useProgramRail.js";
import useSnapScroll from "../components/useSnapScroll.js";
import { snapPreviewEnabled } from "../snapPreview.js";
import useReviewStack from "../components/useReviewStack.js";
import useSectionEntrance from "../components/useSectionEntrance.js";
import { HeroScene, OnlineJourney, usePlaygroundMotion } from "../components/PlaygroundScenes.jsx";

import { googleReviews } from "../content/site.js";
import {
  SplitText,
  Curve,
  V4Shell,
  usePauseOffscreen,
} from "../v4/kit.jsx";
import Counter from "../components/Counter.jsx";
import "../v4.css";
import Typewriter, { useSingleLine } from "../v4/Typewriter.jsx";

// Riječi koje se izmjenjuju u naslovu heroja (stalna referenca, da se efekt ne restartira).
const heroWords = ["razgovor?", "savjet?", "podršku?"];

/* ============================================================
   V4 — "Utočište": Méline Gobet struktura i tranzicije × v3
   pastelna paleta.
   - bg morph: pozadina wrappera prelazi u boju dominantne sekcije
   - zaobljeni vrhovi: svaka obojana sekcija je divovski krug
     (600vw) čiji luk "nestaje" kako scrollaš (Méline trik)
   - programi: horizontalni pin (iz v3)
   - iskustva: sticky stack — kartica PREKO kartice (iz v2)
   ============================================================ */

// Sekcija je terra → NIJEDAN chip nije terra (blush), inače bi se stopio.
// Ostaju magla / kadulja / bijela, izmjenično.
// Kartice tema: obojeni kut (kao kartice programa) s K1 rasporedom; paper = boja kuta.
// Boje prate kartice programa iste teme (pc-palette po poziciji u galeriji):
// Anksioznost plava, Stres zelena, Samopouzdanje breskva, Odnosi plava.
// Zauzimanje za sebe (breskva) i Roditeljstvo (zelena) nemaju program.
// Pet mekanih zvjezdica: obrub iste boje s okruglim spojevima zaobljuje vrhove.
function ReviewStars() {
  return (
    <span className="pg-review-stars" role="img" aria-label="Ocjena 5 od 5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.2l2.6 5.3 5.8.85-4.2 4.1 1 5.8L12 16.5l-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z" />
        </svg>
      ))}
    </span>
  );
}

// Dio recenzije (točno kako piše u tekstu) podcrta se markerom; ostatak ostaje običan tekst.
function markText(text, phrase) {
  const at = phrase ? text.indexOf(phrase) : -1;
  if (at < 0) return text;
  return <>{text.slice(0, at)}<mark>{phrase}</mark>{text.slice(at + phrase.length)}</>;
}

const CHIP_STYLES = [
  { pos: "c1", color: "lavender", depth: 34, dur: "7s", look: "corner", paper: "var(--ps-mist)" },
  { pos: "c2", color: "cream", depth: -26, dur: "9s", look: "corner", paper: "var(--ps-sage-bg)" },
  { pos: "c3", color: "sage", depth: 46, dur: "8s", look: "corner", paper: "var(--ps-terra)" },
  { pos: "c4", color: "cream", depth: -38, dur: "6.5s", look: "corner", paper: "var(--ps-terra)" },
  { pos: "c5", color: "sage", depth: 24, dur: "7.5s", look: "corner", paper: "var(--ps-mist)" },
  { pos: "c6", color: "lavender", depth: -30, dur: "8.5s", look: "corner", paper: "var(--ps-sage-bg)" },
];

export default function V4Page() {
  const heroRef = useRef(null);
  const reviewsRef = useRef(null);
  const ivanaRef = useRef(null);
  const topicsRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const statsRef = useRef(null);
  const closingRef = useRef(null);

  usePlaygroundMotion(heroRef);
  const ivanaReady = useRefinedSections(ivanaRef, topicsRef);
  usePauseOffscreen(ivanaRef);
  usePauseOffscreen(pinRef);
  const heroTitleRef = useRef(null);
  useSingleLine(heroTitleRef);
  useReviewStack(reviewsRef);
  const statsReady = useSectionEntrance(statsRef, ".v4-h2", .82);
  const reviewsReady = useSectionEntrance(reviewsRef, ".v4-iskustva__head", .82);
  const closingReady = useSectionEntrance(closingRef, ".v4-cta__title", .82);
  const programsReady = useSectionEntrance(pinRef, ".v4-programi__head", .82);
  const [programCardsReady, setProgramCardsReady] = useState(false);
  useEffect(() => {
    if (!programsReady) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = () => setProgramCardsReady(true);
    if (motion.matches) { reveal(); return; }
    // Reveal cards as soon as the shared title animation finishes.
    const titleLetters = [..."Online programi"].filter(letter => !/\s/.test(letter)).length;
    const titleDuration = 100 + Math.max(0, titleLetters - 1) * 8 + 400;
    const timer = setTimeout(reveal, titleDuration);
    const onMotion = () => { if (motion.matches) { clearTimeout(timer); reveal(); } };
    motion.addEventListener("change", onMotion);
    return () => { clearTimeout(timer); motion.removeEventListener("change", onMotion); };
  }, [programsReady]);

  // Keep the pinned gallery only while every card fits vertically. This
  // also responds to font loading, content height, zoom and motion settings.
  // Cinematic scroll (zadano uključen, ?snap=0 isključuje; pamti se za
  // trajanja kartice). Poziva se prije useProgramRail da prvi dobije kotačić.
  useSnapScroll(() => pinRef.current?.closest(".v4"), { enabled: snapPreviewEnabled() });
  // Naslovna: jedan scroll = jedna kartica.
  useProgramRail(pinRef, trackRef, progressRef, { stepped: true });

  const quotes = iskustva.filter((quote, index, all) =>
    all.findIndex((other) => other.name === quote.name && other.text === quote.text) === index,
  );

  return (
    <V4Shell className="marketing-page pg-playground pg-premium">
      {/* ===== 1. HERO — Méline asimetrija + rotirajući prsten ===== */}
      <section className="v4-hero" data-bg="#fbf5ec" ref={heroRef} data-stop>
        <div className="v4-hero__text">
          <span className="v4-label v4-hero__kicker">
            Psihogym
          </span>
          <h1 className="v4-hero__name pg-hero-typed" ref={heroTitleRef}>
            <span className="v4-sr-only">Trebaš razgovor, savjet ili podršku?</span>
            <span className="pg-hero-typed__lead" aria-hidden="true">Trebaš </span>
            <Typewriter words={heroWords} className="v4-split__soft" />
          </h1>
          <div className="pg-hero-actions" data-pg-reveal>
            <Link to="/programi" className="v4-btn">Istraži programe <span className="cta-arrow" aria-hidden="true">↗</span></Link>
            <Link to="/kontakt" className="v4-btn pg-hero-secondary">Pričajmo <span className="cta-arrow" aria-hidden="true">↗</span></Link>
          </div>

          {/* Google ocjena */}
          <a className="v4-rate" data-pg-reveal href={googleReviews.url} target="_blank" rel="noopener noreferrer"
            aria-label={`Psihogym na Google kartama, ocjena ${googleReviews.rating} od 5 (novi prozor)`}>
            <span className="v4-rate__v">{googleReviews.rating}</span>
            <span className="v4-rate__sep" aria-hidden="true" />
            <span>
              <span className="v4-rate__stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24">
                    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
                  </svg>
                ))}
              </span>
              <span className="v4-rate__lbl">Google recenzije</span>
            </span>
          </a>
        </div>
        <HeroScene />
      </section>

      {/* ===== 2. PROGRAMI — horizontalni pin ===== */}
      {/* Boje pozadina idu redom kao prije premještanja sekcija: programi krem (kao hero), Ivana svijetla breskva, teme krem, individualni rad plava. */}
      <Curve color="#fbf5ec" className="v4-programi pg-original-programs" id="programi" consumeStart={0.55} innerRef={pinRef} data-program-intro={programsReady} data-program-cards={programCardsReady}>
        <div className="v4-programi__sticky">
          <div className="v4-programi__head">
            <SplitText as="h2" className="v4-h2" active={programsReady} delay={0.1} segments={[{ text: "Online programi" }]} />
            <SplitText as="p" className="v4-programi__subtitle" active={programsReady} delay={0.16} segments={[{ text: "Rasti svojim tempom" }]} />
              <div className="v4-program v4-program--intro">
                <SplitText as="p" className="v4-program__tagline" active={programsReady} delay={0.22} segments={[{ text: "Videolekcije i dnevnik s vježbama. Struktura koja te nježno vodi kroz promjenu, kad tebi odgovara." }]} />
                <Link to="/programi" className="v4-btn v4-program__cta">
                  <span>Pogledaj programe</span><span className="cta-arrow" aria-hidden="true">↗</span>
                </Link>
              </div>
          </div>
          <div className="v4-programi__viewport" tabIndex={0} role="region" aria-label="Pregled online programa">
            <div className="v4-programi__track" ref={trackRef}>

              {programi.map((p, index) => (
                <ProgramPreviewCard program={p} index={index} key={p.id} />
              ))}
            </div>
          </div>
          <div className="v4-programi__progress">
            <span ref={progressRef} />
          </div>
        </div>
      </Curve>

      {/* ===== 3. IVANA — arch slika, tekst ispod ===== */}
      <Curve color="#f6e6da" className="v4-ivana reading-exit reading-exit--short pg-ivana-late" innerRef={ivanaRef} data-stop>
        <div className="v4-ivana__media">
          <div className="pg-ivana-frame">
            <div className="pg-ivana-backdrop" aria-hidden="true"><div className="pg-ivana-backdrop-shape" /></div>
            <div className="pg-ivana-image">
              <img src="/playground/conversation.webp" alt="Ivana Bešlić tijekom razgovora u savjetovalištu" width="1300" height="867" loading="lazy" />
            </div>
          </div>
        </div>
        {/* desni stupac — referenca .iv .tx */}
        <div className="v4-ivana__tx">

          <SplitText as="h2" className="v4-ivana__name" active={ivanaReady} delay={0.1} segments={[{ text: "Ivana Bešlić" }]} />
          <SplitText as="p" className="v4-ivana__role" active={ivanaReady} delay={0.22} segments={[{ text: "Socijalna pedagoginja" }, { text: "specijalizantica psihoterapije", br: true }]} />
          <div className="v4-ivana__q">
            <SplitText as="q" active={ivanaReady} delay={0.34} segments={[{ text: "Ne moraš imati sve odgovore. Promjene u odnosu prema sebi, prema drugima i u svakodnevnici često počinju malim koracima." }]} />
            <Link to="/kontakt" className="v4-btn v4-ivana__cta pg-sequence-cta">
              <span>Pričajmo</span><span className="cta-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </Curve>

      {/* ===== 4. TEME — floating chipovi + cursor =====
          Krem: Ivana iznad je svijetla breskva, pa se granica sekcija vidi. */}
      <Curve color="#fbf5ec" className="v4-podrucja pg-topics-scroll" innerRef={topicsRef} consumeStart={0.95} data-stop>

        <SplitText as="h2" className="v4-podrucja__title pg-topics-heading" delay={0.1} segments={[{ text: "Teme o kojima pričamo" }]} />
        <div className="v4-podrucja__chips">
          {podrucja.map((item, i) => {
            const c = CHIP_STYLES[i];
            return (
              <div
                className={`v4-chip v4-chip--${c.color} v4-chip--${c.pos} pg-topic--${c.look}`}
                style={{ "--topic-paper": c.paper }}
                key={item.num}
              >
                <div
                  className="v4-chip__inner"
                  style={{ animationDuration: c.dur }}
                >
                  <span className="v4-chip__num">{item.num}</span>
                  <span className="v4-chip__title">{item.title.join(" ")}</span>
                  <span className="v4-chip__desc">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Curve>

      {/* ===== 5. ONLINE INDIVIDUALNI RAD ===== */}
      <Curve color="#e2ecf1" className="v4-online" data-ride-wave data-stop>
        <OnlineJourney />
      </Curve>

      {/* ===== 6. DETALJI KOJI ČINE RAZLIKU — brojke ===== */}
      {/* Bez data-ride-wave: iza "Online individualnog rada" tekst se ne podiže s valom, nego mirno scrolla. */}
      <Curve color="#e5ecdd" className="v4-stats" innerRef={statsRef} data-stop>
        <div className="pg-stats-content">
          <SplitText as="h2" className="v4-h2" active={statsReady} delay={0.1} segments={[{ text: "Detalji koji čine razliku" }]} />
          <dl className="v4-stats__grid">
            {stats.map((s, i) => (
              <div className="v4-stats__item" data-pg-reveal style={{ transitionDelay: `${220 + i * 90}ms` }} key={s.label}>
                <dt className="v4-stats__value">
                  <Counter value={s.value} suffix={s.suffix} />
                </dt>
                <dd className="v4-stats__label">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Curve>

      {/* ===== 7. ISKUSTVA — kartica PREKO kartice (cjelovite recenzije) ===== */}
      <Curve color="#e5ecdd" className="v4-iskustva" innerRef={reviewsRef} data-stop>
        <div className="v4-iskustva__head">
          <SplitText as="h2" className="v4-h2" active={reviewsReady} delay={0.1} segments={[{ text: "Riječi koje ostaju" }]} />
        </div>
        {quotes.map((q, i) => (
          <div className={`v4-step${q.text.trim().split(/\s+/).length > 30 ? " v4-step--long" : ""}`} key={i}>
            <figure className={`v4-stackcard pg-review--${q.design || "centered"}`} style={{ "--quote-delay": `${-i * 1.7}s` }}>
              {/* Navodnici u stilu asteriska iz heroja: iza teksta, lagano lebde. */}
              <span className="pg-quote-mark" aria-hidden="true">
                {/* Meki, zaobljeni navodnici (bez šiljaka), kao latice asteriska. */}
                <svg viewBox="6 12 64 48" fill="currentColor">
                  <path d="M24 16C29.5 16 34 20.5 34 26C34 38.5 27 49 14.5 56C11.9 57.4 9.9 55 11.8 53.1C16.6 48.4 19.6 43.4 20.6 36.5C16.7 35.1 14 31 14 26C14 20.5 18.5 16 24 16Z" />
                  <path d="M24 16C29.5 16 34 20.5 34 26C34 38.5 27 49 14.5 56C11.9 57.4 9.9 55 11.8 53.1C16.6 48.4 19.6 43.4 20.6 36.5C16.7 35.1 14 31 14 26C14 20.5 18.5 16 24 16Z" transform="translate(30 0)" />
                </svg>
              </span>
              {/* PROBA četiri dizajna (q.design): centered · heading · marker · rule. */}
              {q.design === "rule" ? (
                <>
                  <div className="pg-review-top">
                    <figcaption>{q.name}</figcaption>
                    <ReviewStars />
                  </div>
                  <p className="pg-review-highlight">{q.highlight}</p>
                  <blockquote className="pg-review-full">{q.text}</blockquote>
                </>
              ) : (
                <>
                  <ReviewStars />
                  {q.highlight && q.design !== "centered" && (
                    <p className="pg-review-highlight">
                      {q.mark && <><mark>{q.mark}</mark>{" "}</>}{q.highlight}
                    </p>
                  )}
                  <blockquote className={q.highlight && q.design !== "centered" ? "pg-review-full" : undefined}>{markText(q.text, q.textMark)}</blockquote>
                  {q.design === "centered" && <span className="pg-review-rule" aria-hidden="true" />}
                  <figcaption>{q.name}</figcaption>
                </>
              )}
            </figure>
          </div>
        ))}
      </Curve>

      {/* ===== 8. CTA ===== */}
      <Curve color="#fbf5ec" className="v4-cta pg-home-closing" innerRef={closingRef} consumeStart={0.55} data-center-wave data-stop>
        <SplitText as="h2" className="v4-cta__title" active={closingReady} delay={0.1} segments={[{ text: "Puno toga ti se vrti po glavi?" }, { text: "To je potpuno u redu.", soft: true }]} />
        <Link to="/kontakt" className="v4-btn">Ispričaj svoju priču<span className="cta-arrow" aria-hidden="true">↗</span></Link>
      </Curve>
    </V4Shell>
  );
}


