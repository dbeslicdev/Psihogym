import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { podrucja, iskustva, programi, stats } from "../data.js";
import ProgramPreviewCard from "../components/ProgramPreviewCard.jsx";
import useRefinedSections from "../components/useRefinedSections.js";
import useProgramRail from "../components/useProgramRail.js";
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
const CHIP_STYLES = [
  { pos: "c1", color: "lavender", depth: 34, dur: "7s" },
  { pos: "c2", color: "cream", depth: -26, dur: "9s" },
  { pos: "c3", color: "sage", depth: 46, dur: "8s" },
  { pos: "c4", color: "cream", depth: -38, dur: "6.5s" },
  { pos: "c5", color: "sage", depth: 24, dur: "7.5s" },
  { pos: "c6", color: "lavender", depth: -30, dur: "8.5s" },
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
  // Variant B: keep reviews in the left column, level with the portrait bottom.
  useEffect(() => {
    const hero = heroRef.current;
    const copy = hero?.querySelector(".v4-hero__text");
    const rating = hero?.querySelector(".v4-rate");
    const portrait = hero?.querySelector(".pg-hero-portrait");
    if (!copy || !rating || !portrait) return;
    const wide = matchMedia("(min-width: 60.001rem)");
    let frame;
    let disposed = false;
    const reset = () => {
      copy.style.minHeight = "";
      rating.style.position = "";
      rating.style.top = "";
      rating.style.left = "";
      rating.style.marginTop = "";
    };
    const place = () => {
      frame = undefined;
      reset();
      if (!wide.matches) return;
      const copyBox = copy.getBoundingClientRect();
      const photoBox = portrait.getBoundingClientRect();
      const ratingHeight = rating.offsetHeight;
      const actionsBottom = hero.querySelector(".pg-hero-actions").getBoundingClientRect().bottom;
      // Keep normal flow if a short window cannot accommodate this alignment.
      if (photoBox.bottom - ratingHeight < actionsBottom + 24) return;
      copy.style.minHeight = `${copyBox.height}px`;
      // The rating remains in the copy for reading order; .v4-hero is its
      // absolute-positioning containing block (copy's transform is animated).
      const ratingTop = photoBox.bottom - ratingHeight - copyBox.top;
      copy.style.position = "relative";
      rating.style.position = "absolute";
      rating.style.top = `${ratingTop}px`;
      rating.style.left = "0px";
      rating.style.marginTop = "0px";
    };
    const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(place); };
    const observer = new ResizeObserver(schedule);
    observer.observe(portrait);
    window.addEventListener("resize", schedule);
    wide.addEventListener("change", schedule);
    document.fonts.ready.then(() => { if (!disposed) schedule(); });
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      wide.removeEventListener("change", schedule);
      reset();
      copy.style.position = "";
    };
  }, []);
  const ivanaReady = useRefinedSections(ivanaRef, topicsRef);
  usePauseOffscreen(ivanaRef);
  usePauseOffscreen(pinRef);
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
    const titleLetters = [..."Rasti svojim tempom"].filter(letter => !/\s/.test(letter)).length;
    const titleDuration = 100 + Math.max(0, titleLetters - 1) * 8 + 400;
    const timer = setTimeout(reveal, titleDuration);
    const onMotion = () => { if (motion.matches) { clearTimeout(timer); reveal(); } };
    motion.addEventListener("change", onMotion);
    return () => { clearTimeout(timer); motion.removeEventListener("change", onMotion); };
  }, [programsReady]);

  // Keep the pinned gallery only while every card fits vertically. This
  // also responds to font loading, content height, zoom and motion settings.
  useProgramRail(pinRef, trackRef, progressRef);

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
          <SplitText
            as="h1"
            className="v4-hero__name"
            delay={0.1}
            segments={[
              { text: "Siguran online prostor" },
              { text: "za učenje i razgovor", soft: true },
            ]}
          />
          <div className="pg-hero-actions" data-pg-reveal>
            <Link to="/kontakt" className="v4-btn">Dogovori razgovor <span className="cta-arrow" aria-hidden="true">↗</span></Link>
            <Link to="/programi" className="v4-btn pg-hero-secondary">Istraži programe <span className="cta-arrow" aria-hidden="true">↗</span></Link>
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
        <div className="pg-hero-footer" aria-hidden="true" />
      </section>

      {/* ===== 2. EMPHASIS — tri velike rečenice ===== */}
      {/* Sve krem (kao hero), bez luka, isti font + Méline word-rise */}
      <section
        className="v4-emphasis v4-emphasis--flat v4-emphasis--intro"
        data-bg="#fbf5ec"
      >
       
        <SplitText
          segments={[
            {
              text: "Pružamo online podršku mladima i odraslima koji žele više od sebe.",
            },
          ]}
        />
      </section>
      {/* ===== 3. IVANA — arch slika, tekst ispod ===== */}
      <Curve color="#fbf5ec" className="v4-ivana reading-exit reading-exit--short pg-ivana-late" innerRef={ivanaRef} data-stop>
        <div className="v4-ivana__media">
          <div className="pg-ivana-frame">
            <div className="pg-ivana-backdrop" aria-hidden="true"><div className="pg-ivana-backdrop-shape" /></div>
            <div className="pg-ivana-image">
              <img src="/playground/conversation.webp" alt="Ivana Bešlić tijekom razgovora u savjetovalištu" width="1300" height="867" loading="lazy" />
            </div>
            <div className="pg-ivana-caption">TVOJ PROSTOR. TVOJ TEMPO.</div>
          </div>
        </div>
        {/* desni stupac — referenca .iv .tx */}
        <div className="v4-ivana__tx">

          <SplitText as="h2" className="v4-ivana__name" active={ivanaReady} delay={0.1} segments={[{ text: "Ivana Bešlić" }]} />
          <SplitText as="p" className="v4-ivana__role" active={ivanaReady} delay={0.22} segments={[{ text: "Magistra socijalne pedagogije i savjetodavna terapeutkinja" }]} />
          <div className="v4-ivana__q">
            <SplitText as="q" active={ivanaReady} delay={0.34} segments={[{ text: "U našim je razgovorima OK biti svoj. Vjerujem da svi možemo mijenjati ono što nam ne odgovara – u sebi, u odnosima i u svakodnevnici." }]} />
            <Link to="/kontakt" className="v4-btn v4-ivana__cta pg-sequence-cta">
              <span>Pričajmo</span><span className="cta-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </Curve>

      {/* ===== 5. TEME — floating chipovi + cursor =====
          Terra (ne krem): Ivana iznad je krem, pa bi ista boja "progutala"
          istu i granica sekcija bi nestala (najvidljivije na mobitelu). */}
      <Curve color="#efcfbe" className="v4-podrucja pg-topics-scroll" innerRef={topicsRef} consumeStart={0.95} data-stop>

        <SplitText as="h2" className="v4-podrucja__title pg-topics-heading" delay={0.1} segments={[{ text: "Teme o kojima pričamo" }]} />
        <div className="v4-podrucja__chips">
          {podrucja.map((item, i) => {
            const c = CHIP_STYLES[i];
            return (
              <div
                className={`v4-chip v4-chip--${c.color} v4-chip--${c.pos}`}
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

      {/* ===== 6. ONLINE SAVJETOVANJE ===== */}
      <Curve color="#fbf5ec" className="v4-online" data-ride-wave data-stop>
        <OnlineJourney />
      </Curve>

      {/* ===== 7. PROGRAMI — horizontalni pin ===== */}
      {/* Cyan surface matches the 25-day programme artwork. */}
      <Curve color="#e2ecf1" className="v4-programi pg-original-programs" id="programi" consumeStart={0.55} innerRef={pinRef} data-thread-behind data-program-intro={programsReady} data-program-cards={programCardsReady}>
        <div className="v4-programi__sticky">
          <div className="v4-programi__head">
            <SplitText as="h2" className="v4-h2" active={programsReady} delay={0.1} segments={[{ text: "Rasti svojim tempom" }]} />
              <div className="v4-program v4-program--intro">
                <SplitText as="p" className="v4-program__tagline" active={programsReady} delay={0.22} segments={[{ text: "Video lekcije i vođene vježbe — struktura koja te nježno vodi kroz promjenu, kad tebi odgovara." }]} />
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

      {/* ===== 8. DETALJI KOJI ČINE RAZLIKU — brojke ===== */}
      <Curve color="#e5ecdd" className="v4-stats" innerRef={statsRef} data-ride-wave data-stop>
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

      {/* ===== 9. ISKUSTVA — kartica PREKO kartice (cjelovite recenzije) ===== */}
      <Curve color="#e5ecdd" className="v4-iskustva" innerRef={reviewsRef} data-stop>
        <div className="v4-iskustva__head">
          <SplitText as="h2" className="v4-h2" active={reviewsReady} delay={0.1} segments={[{ text: "Riječi koje ostaju" }]} />
        </div>
        {quotes.map((q, i) => (
          <div className={`v4-step${q.text.trim().split(/\s+/).length > 30 ? " v4-step--long" : ""}`} key={i}>
            <figure className="v4-stackcard">
              <blockquote>„{q.text}"</blockquote>
              <figcaption>{q.name}</figcaption>
            </figure>
          </div>
        ))}
      </Curve>

      {/* ===== 8. CTA ===== */}
      <Curve color="#e4d9cd" className="v4-cta pg-home-closing" innerRef={closingRef} consumeStart={0.55} data-center-wave data-stop>
        <SplitText as="h2" className="v4-cta__title" active={closingReady} delay={0.1} segments={[{ text: "Puno toga ti se vrti po glavi?" }, { text: "To je potpuno u redu.", soft: true }]} />
        <Link to="/kontakt" className="v4-btn">Ispričaj svoju priču<span className="cta-arrow" aria-hidden="true">↗</span></Link>
      </Curve>
    </V4Shell>
  );
}


