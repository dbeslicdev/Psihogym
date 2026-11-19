import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Curve, SplitText } from "../v4/kit.jsx";
import useSectionEntrance from "./useSectionEntrance.js";
import ProgramArtwork, { BrandEmblem } from "./ProgramArtwork.jsx";

export function usePlaygroundMotion(heroRef) {
  useEffect(() => {
    const root = document.querySelector(".pg-playground");
    const hero = heroRef.current;
    if (!root || !hero) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const controller = new AbortController();
    const items = [...root.querySelectorAll("[data-pg-reveal]")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        if (target.hasAttribute("data-pg-reveal")) target.dataset.in = "true";
        else target.querySelectorAll('[data-pg-reveal="mask"]').forEach((item) => { item.dataset.in = "true"; });
        observer.unobserve(target);
      });
    }, { threshold: 0.06 });
    // Observe the unmasked scene rather than an image clipped to zero:
    // a fully clipped target has no intersection until it is revealed.
    items.forEach((item) => observer.observe(item.dataset.pgReveal === "mask" ? item.parentElement : item));
    const visibility = new IntersectionObserver(([entry]) => {
      hero.dataset.paused = String(!entry.isIntersecting || document.hidden);
    });
    visibility.observe(hero);
    let frame;
    const reset = () => {
      hero.style.setProperty("--pg-x", "0px");
      hero.style.setProperty("--pg-y", "0px");
    };
    const onMove = (event) => {
      if (motion.matches || !pointer.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--pg-x", ((event.clientX - rect.left) / rect.width * 2 - 1) * 8 + "px");
        hero.style.setProperty("--pg-y", ((event.clientY - rect.top) / rect.height * 2 - 1) * 6 + "px");
      });
    };
    const applyMotion = () => {
      reset();
      if (motion.matches) items.forEach((item) => { item.dataset.in = "true"; });
    };
    hero.addEventListener("pointermove", onMove, { passive: true, signal: controller.signal });
    hero.addEventListener("pointerleave", reset, { signal: controller.signal });
    motion.addEventListener("change", applyMotion, { signal: controller.signal });
    document.addEventListener("visibilitychange", () => {
      hero.dataset.paused = String(document.hidden || hero.getBoundingClientRect().bottom < 0);
    }, { signal: controller.signal });
    applyMotion();
    return () => {
      controller.abort();
      observer.disconnect();
      visibility.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [heroRef]);
}

export function ThreadMark({ className = "" }) {
  return (
    <svg className={"pg-thread-mark " + className} viewBox="0 0 240 150" fill="none" aria-hidden="true">
      <path d="M8 112C38 112 35 30 86 30C130 30 143 115 99 115C65 115 68 62 121 62C176 62 165 133 204 133C221 133 225 109 233 99"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="233" cy="99" r="5" fill="currentColor" />
    </svg>
  );
}

function HeroSymbol({ kind }) {
  if (kind === "asterisk") return <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
    {[0, 60, 120, 180, 240, 300].map(angle => (
      <path key={angle} d="M48 50C48 39 43 26 43 16C43 12 46 10 50 10C54 10 57 12 57 16C57 26 52 39 52 50Z" transform={"rotate(" + angle + " 50 50)"} />
    ))}
    <circle cx="50" cy="50" r="5" />
  </svg>;
  if (kind === "rings") return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
    {[12, 22, 32, 42].map((radius) => <circle key={radius} cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="1.5" />)}
    <circle cx="50" cy="50" r="3" fill="currentColor" />
  </svg>;
  if (kind === "spiral") return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path d="M50 50c0-8-12-9-15-1-4 11 12 19 24 10 17-13 6-39-16-36-29 3-37 39-15 57 29 23 70-5 57-40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
  if (kind === "waves") return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path d="M12 29c13-13 25 13 38 0s25 13 38 0M12 40c13-13 25 13 38 0s25 13 38 0M12 51c13-13 25 13 38 0s25 13 38 0M12 62c13-13 25 13 38 0s25 13 38 0M12 73c13-13 25 13 38 0s25 13 38 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>;
  if (kind === "connection") return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <ellipse cx="40" cy="50" rx="22" ry="34" stroke="currentColor" strokeWidth="1.6" transform="rotate(-18 40 50)" />
    <ellipse cx="60" cy="50" rx="22" ry="34" stroke="currentColor" strokeWidth="1.6" transform="rotate(18 60 50)" />
  </svg>;
  return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
    {[0, 60, 120, 180, 240, 300].map((angle) => <ellipse key={angle} cx="50" cy="28" rx="9" ry="25" stroke="currentColor" strokeWidth="1.45" transform={'rotate(' + angle + ' 50 50)'} />)}
    <circle cx="50" cy="50" r="4" fill="currentColor" />
  </svg>;
}

export function HeroScene() {
  return (
    <div className="pg-hero-scene">
      <div className="pg-hero-orbit" aria-hidden="true" />
      <div className="pg-hero-portrait" data-pg-reveal="mask">
        <img src="/playground/ivana-portrait.webp" alt="Ivana Bešlić, savjetodavna terapeutkinja" width="950" height="1426" fetchPriority="high" />

      </div>
      <div className="pg-hero-selected-symbol pg-hero-selected-symbol--asterisk" aria-hidden="true">
        <HeroSymbol kind="asterisk" />
      </div>

    </div>
  );
}

export function OnlineJourney() {
  const entranceRef = useRef(null);
  const ready = useSectionEntrance(entranceRef, ".pg-online-copy");
  return (
    <div className="pg-online-sequence pg-online-text-only" ref={entranceRef}>
      <div className="pg-online-copy">
        <SplitText as="h2" className="v4-h2 pg-online-title" active={ready} delay={0.1} segments={[{ text: "Online savjetovanje" }]} />
        <SplitText as="p" className="pg-online-subtitle" active={ready} delay={0.22} segments={[{ text: "Bez obzira na lokaciju, tu smo za tebe." }]} />
        <SplitText as="p" className="pg-online-body" active={ready} delay={0.34} segments={[{ text: "Dobivaš istu kvalitetu podrške kao i uživo, i to bez izlaska iz kuće. Sve što ti treba je stabilan internet, malo privatnosti i kamera – i možemo početi." }]} />
        <Link to="/kontakt" className="v4-btn pg-sequence-cta">Dogovori termin <span className="cta-arrow" aria-hidden="true">↗</span></Link>
      </div>
    </div>
  );
}

export function ProgramCover({ program }) {
  return <ProgramArtwork program={program} />;
}

const MOODS = ["Smireno", "Pomiješano", "Napeto"];

export function MaterialsPreview() {
  const [mood, setMood] = useState(null);
  return (
    <Curve className="pg-materials" color="#fbf5ec" data-stop aria-labelledby="pg-materials-title">
      <div className="pg-materials-visual" data-pg-reveal>
        <div className="pg-book" aria-hidden="true">
          <span>psihogym.</span>
          <ThreadMark />
          <p>Prostor<br />za mene.</p>
          <small>Dnevnik osobnog razvoja</small>
        </div>
        <div className="pg-journal">
          <div className="pg-journal-top"><span>Primjer refleksije</span><span aria-hidden="true">↗</span></div>
          <p className="pg-journal-question">Kako se danas<br /><em>osjećam?</em></p>
          <div className="pg-moods" role="group" aria-label="Odaberi osjećaj u primjeru dnevnika">
            {MOODS.map((item) => <button key={item} type="button" aria-pressed={mood === item} onClick={() => setMood(item)}>{item}</button>)}
          </div>
          <div className="pg-journal-answer" aria-live="polite">
            {mood ? <p><span>{mood}</span>Što je danas utjecalo na taj osjećaj?</p> : <p>Odvoji trenutak.<br />Primijeti što se događa u tebi.</p>}
          </div>
          <div className="pg-journal-lines" aria-hidden="true"><span /><span /><span /></div>
          <span className="pg-journal-foot">Primjer prikaza dnevnika</span>
        </div>
      </div>
      <div className="pg-materials-copy" data-pg-reveal>
        <span className="pg-eyebrow">Znanje koje nosiš sa sobom</span>
        <h2 id="pg-materials-title" className="v4-h2">Pogledaj. Zastani.<br /><em>Primijeni.</em></h2>
        <p className="pg-lead">Video lekcije, vođene vježbe i tvoj dnevnik. Prostor za promjenu, korak po korak.</p>
        <p>Programi povezuju učenje s refleksijom i vježbama koje radiš svojim tempom.</p>
        <Link to="/#programi" className="pg-text-link">Istraži programe <span aria-hidden="true">↗</span></Link>
      </div>
    </Curve>
  );
}
