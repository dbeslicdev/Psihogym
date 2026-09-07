import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { podrucja, iskustva, programi } from "../data.js";
import "../v3.css";

/* ============================================================
   V3 — "Nježnost": pastelni prototip (lavanda + blush + kadulja).
   Efekti: aurora valovi (CSS drift + scroll parallax po sloju),
   floating okviri s cursor-depth parallaxom, usporeni tempo,
   horizontalna editorial galerija programa.
   ============================================================ */

const HERO_WORDS = ["Nježno", "prema", "sebi,", "hrabro", "prema", "životu."];

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Aurora valovi — 3 sloja mekih sinusa; boje pastelne, drift u CSS-u */
function Waves() {
  const d =
    "M0,110 C240,40 480,40 720,110 S1200,180 1440,110 S1920,40 2160,110 S2640,180 2880,110 L2880,220 L0,220 Z";
  return (
    <div className="v3-waves" aria-hidden="true">
      <div className="v3-wave v3-wave--1" data-wave-speed="0.10">
        <svg viewBox="0 0 2880 220" preserveAspectRatio="none">
          <path d={d} fill="#a8b5a1" opacity="0.45" />
        </svg>
      </div>
      <div className="v3-wave v3-wave--2" data-wave-speed="0.18">
        <svg viewBox="0 0 2880 220" preserveAspectRatio="none">
          <path d={d} fill="#f2d8d5" opacity="0.65" />
        </svg>
      </div>
      <div className="v3-wave v3-wave--3" data-wave-speed="0.28">
        <svg viewBox="0 0 2880 220" preserveAspectRatio="none">
          <path d={d} fill="#c9c3e6" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}

export default function V3Page() {
  const floatRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  /* Aurora valovi: scroll parallax — svaki sloj "izranja" svojom brzinom */
  useEffect(() => {
    if (reduceMotion()) return;
    const waves = [...document.querySelectorAll(".v3-wave")];
    if (!waves.length) return;
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      waves.forEach((w) => {
        const speed = parseFloat(w.dataset.waveSpeed || "0.15");
        const rect = w.parentElement.getBoundingClientRect();
        // koliko je kontejner valova "ušao" u viewport
        const progress = Math.min(Math.max((vh - rect.top) / vh, 0), 2);
        w.style.transform = `translateY(${(progress * -speed * 90).toFixed(1)}px)`;
      });
      ticking = false;
    };

    const ctrl = new AbortController();
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true, signal: ctrl.signal },
    );
    update();
    return () => ctrl.abort();
  }, []);

  /* Floating okviri: cursor-depth parallax s mekim lerpom (usporeni tempo) */
  useEffect(() => {
    const section = floatRef.current;
    if (!section) return;
    if (reduceMotion() || window.matchMedia("(pointer: coarse)").matches) return;

    const chips = [...section.querySelectorAll("[data-depth]")];
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = null;

    const loop = () => {
      cur.x += (target.x - cur.x) * 0.05; // spori, njegujući lerp
      cur.y += (target.y - cur.y) * 0.05;
      chips.forEach((chip) => {
        const depth = parseFloat(chip.dataset.depth);
        chip.style.transform = `translate(${(cur.x * depth).toFixed(1)}px, ${(cur.y * depth).toFixed(1)}px)`;
      });
      raf = requestAnimationFrame(loop);
    };

    const ctrl = new AbortController();
    section.addEventListener(
      "mousemove",
      (e) => {
        const r = section.getBoundingClientRect();
        target.x = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
        target.y = (e.clientY - r.top) / r.height - 0.5;
      },
      { passive: true, signal: ctrl.signal },
    );
    section.addEventListener(
      "mouseleave",
      () => {
        target.x = 0;
        target.y = 0;
      },
      { signal: ctrl.signal },
    );
    raf = requestAnimationFrame(loop);
    return () => {
      ctrl.abort();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Programi: pinned horizontalna galerija + progress */
  useEffect(() => {
    const section = pinRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (reduceMotion() || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    const viewport = section.querySelector(".v3-programi__viewport");
    if (!viewport) return;

    let maxOffset = 0;
    const measure = () => {
      maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.height = `${window.innerHeight + maxOffset}px`;
    };
    const onScroll = () => {
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(
        Math.max(-section.getBoundingClientRect().top, 0),
        total,
      );
      const progress = scrolled / total;
      track.style.transform = `translateX(${(-progress * maxOffset).toFixed(2)}px)`;
      if (progressRef.current) {
        progressRef.current.style.width = `${(progress * 100).toFixed(1)}%`;
      }
    };

    measure();
    onScroll();
    const ctrl = new AbortController();
    window.addEventListener("scroll", onScroll, {
      passive: true,
      signal: ctrl.signal,
    });
    window.addEventListener(
      "resize",
      () => {
        measure();
        onScroll();
      },
      { passive: true, signal: ctrl.signal },
    );
    return () => {
      ctrl.abort();
      section.style.height = "";
    };
  }, []);

  const citat = iskustva[3]; // Gabrijela Stella S. — "centar unutarnje snage"
  let w = 0;

  return (
    <div className="v3">
      {/* ===== 1. HERO + AURORA VALOVI ===== */}
      <section className="v3-hero">
        <span className="v3-label">( online psihosocijalno savjetovalište )</span>
        <h1 className="v3-hero__title">
          {HERO_WORDS.map((word, i) => (
            <span key={i}>
              <span className="v3-word">
                <span style={{ animationDelay: `${0.2 + w++ * 0.11}s` }}>
                  {i >= 3 ? <em>{word}</em> : word}
                </span>
              </span>
              {i < HERO_WORDS.length - 1 && " "}
            </span>
          ))}
        </h1>
        <p className="v3-hero__sub">
          Mi smo online psihosocijalno savjetovalište za mlade i odrasle koji
          traže siguran prostor za razgovor i podršku u izazovnim životnim
          razdobljima.
        </p>
        <div className="v3-hero__cta">
          <Link to="/kontakt" className="v3-btn">Pričajmo</Link>
          <Link to="/programi" className="v3-btn v3-btn--ghost">
            Pogledaj programe
          </Link>
        </div>
        <Waves />
      </section>

      {/* ===== 2. FLOATING OKVIRI + CURSOR ===== */}
      <section className="v3-float" ref={floatRef}>
        <div className="v3-float__arch" data-depth="-10">
          <img src="/hero-geo.jpg" alt="Psihogym savjetovalište" />
        </div>

        <div className="v3-chip v3-chip--lavender v3-chip--p1" data-depth="34">
          <div className="v3-chip__inner" style={{ animationDuration: "7s" }}>
            <span className="v3-chip__num">500+</span>
            <span className="v3-chip__label">klijenata</span>
          </div>
        </div>
        <div className="v3-chip v3-chip--cream v3-chip--p2" data-depth="-26">
          <div className="v3-chip__inner" style={{ animationDuration: "9s" }}>
            <span className="v3-chip__quote">„Siguran prostor za razgovor."</span>
          </div>
        </div>
        <div className="v3-chip v3-chip--blush v3-chip--p3" data-depth="48">
          <div className="v3-chip__inner" style={{ animationDuration: "8s" }}>
            <span className="v3-chip__num">5000+</span>
            <span className="v3-chip__label">sati savjetovanja</span>
          </div>
        </div>
        <div className="v3-chip v3-chip--sage v3-chip--p4" data-depth="-38">
          <div className="v3-chip__inner" style={{ animationDuration: "6.5s" }}>
            <span className="v3-chip__quote">„Tvojim tempom."</span>
          </div>
        </div>
        <div className="v3-chip v3-chip--cream v3-chip--p5" data-depth="22">
          <div className="v3-chip__inner" style={{ animationDuration: "7.5s" }}>
            <span className="v3-chip__num">4.9/5</span>
            <span className="v3-chip__label">Google recenzije</span>
          </div>
        </div>
      </section>

      {/* ===== 3. PODRUČJA — pastelni grid ===== */}
      <section className="v3-podrucja">
        <div className="v3-podrucja__head">
          <span className="v3-label">( naš fokus )</span>
          <h2 className="v3-h2">Područja rada</h2>
        </div>
        <div className="v3-podrucja__grid">
          {podrucja.map((item) => (
            <article className="v3-tile" key={item.num}>
              <span className="v3-tile__num">{item.num}</span>
              <div>
                <h3 className="v3-tile__title">{item.title.join(" ")}</h3>
                <p className="v3-tile__desc">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== 4. PROGRAMI — horizontalna editorial galerija ===== */}
      <section className="v3-programi" ref={pinRef}>
        <div className="v3-programi__sticky">
          <div className="v3-programi__head">
            <div>
              <span className="v3-label">( online programi )</span>
              <h2 className="v3-h2">Rast tvojim tempom</h2>
            </div>
            <span className="v3-label">skrolaj — galerija putuje</span>
          </div>
          <div className="v3-programi__viewport">
            <div className="v3-programi__track" ref={trackRef}>
              <div className="v3-program v3-program--intro">
                <p className="v3-program__tagline">
                  Video lekcije, radni listovi i vođene vježbe — struktura koja
                  te nježno vodi kroz promjenu, kad tebi odgovara.
                </p>
              </div>
              {programi.map((p) => (
                <article className="v3-program" key={p.id}>
                  <div>
                    <div className="v3-program__meta">
                      <span className="v3-program__tag">{p.trajanje}</span>
                      <span className="v3-program__tag">{p.razina}</span>
                    </div>
                    <h3 className="v3-program__title">{p.title}</h3>
                    <p className="v3-program__tagline">{p.tagline}</p>
                  </div>
                  <div className="v3-program__foot">
                    <span className="v3-program__price">{p.cijenaEur} €</span>
                    <Link to="/programi" className="v3-btn v3-btn--ghost">
                      Saznaj više
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="v3-programi__progress">
            <span ref={progressRef} />
          </div>
        </div>
      </section>

      {/* ===== 5. CITAT ===== */}
      <section className="v3-citat">
        <span className="v3-citat__mark" aria-hidden="true">„</span>
        <blockquote className="v3-citat__text">
          Psihogym je za mene definitivno bio centar unutarnje snage koji mi je
          dao alate za nošenje sa životnim problemima koje ću koristiti cijeli
          život.
        </blockquote>
        <span className="v3-citat__name">{citat.name}</span>
      </section>

      {/* ===== 6. CTA + VALOVI ===== */}
      <section className="v3-cta">
        <h2 className="v3-cta__title">
          Puno toga ti se vrti po glavi? <em>To je potpuno u redu.</em>
        </h2>
        <p className="v3-cta__sub">
          Sve što ti treba je malo privatnosti i stabilan internet — i možemo
          početi.
        </p>
        <Link to="/kontakt" className="v3-btn">Ispričaj svoju priču</Link>
        <Waves />
      </section>
    </div>
  );
}
