import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { podrucja, stats, iskustva } from "../data.js";
import "../v2.css";

/* ============================================================
   V2 — "Prostor za disanje": high-end mirna varijanta naslovnice.
   Animacije: word-reveal u heroju, scroll-osvjetljavanje manifesta,
   horizontalni pin za Područja rada, sticky-stack recenzije,
   disajući krug. Sadržaj preuzet iz postojećeg data.js.
   ============================================================ */

const HERO_WORDS = ["Prostor", "u", "kojem", "možeš", "disati."];
const HERO_EM = new Set(["disati."]); // riječi u kurzivu/kadulja boji

const MANIFEST_LINES = [
  "Svi imamo svoje kočnice.",
  "Savjetovanje nije samo za one koji pucaju po šavovima —",
  "već i za one koji žele više od sebe.",
  "Tu smo da te podržimo, tempom koji tebi odgovara.",
];

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Serif brojka koja odbroji kad uđe u viewport */
function Stat({ value, suffix, label }) {
  const ref = useRef(null);
  const [text, setText] = useState(`0${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion()) {
      setText(`${value}${suffix}`);
      return;
    }
    let raf = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (raf) cancelAnimationFrame(raf);
          setText(`0${suffix}`);
          return;
        }
        const start = performance.now();
        const frame = (now) => {
          const t = Math.min(1, (now - start) / 2000);
          const eased = 1 - Math.pow(1 - t, 3);
          setText(Math.round(eased * value) + suffix);
          if (t < 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, suffix]);

  return (
    <div className="v2-stat">
      <div className="v2-stat__num" ref={ref}>{text}</div>
      <div className="v2-stat__label">{label}</div>
    </div>
  );
}

export default function V2Page() {
  const manifestRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  /* Manifest: linije se osvjetljavaju kako se približavaju sredini ekrana */
  useEffect(() => {
    if (reduceMotion()) return;
    const wrap = manifestRef.current;
    if (!wrap) return;
    const lines = [...wrap.querySelectorAll(".v2-manifest__line")];
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      lines.forEach((line) => {
        const r = line.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - vh * 0.5);
        const p = 1 - Math.min(dist / (vh * 0.42), 1);
        line.style.opacity = (0.13 + p * 0.87).toFixed(3);
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

  /* Područja rada: pinned horizontalni scroll + progress traka */
  useEffect(() => {
    const section = pinRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion() || coarse) {
      section.classList.add("v2-podrucja--static");
      return;
    }
    const viewport = section.querySelector(".v2-podrucja__viewport");
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

  // 6. recenzija je duplikat 5. u izvornom sadržaju — preskačemo je
  const quotes = iskustva.slice(0, 5);
  let wordIndex = 0;

  return (
    <div className="v2">
      {/* ===== 1. HERO ===== */}
      <section className="v2-hero">
        <div className="v2-breath" aria-hidden="true" />
        <span className="v2-label">( online psihosocijalno savjetovalište )</span>
        <h1 className="v2-hero__title">
          {HERO_WORDS.map((word, i) => (
            <span key={i}>
              <span className="v2-word">
                <span style={{ animationDelay: `${0.15 + wordIndex++ * 0.09}s` }}>
                  {HERO_EM.has(word) ? <em>{word}</em> : word}
                </span>
              </span>
              {i < HERO_WORDS.length - 1 && " "}
            </span>
          ))}
        </h1>
        <p className="v2-hero__sub">
          Mi smo online psihosocijalno savjetovalište za mlade i odrasle koji
          traže siguran prostor za razgovor i podršku u izazovnim životnim
          razdobljima.
        </p>
        <div className="v2-hero__cta">
          <Link to="/kontakt" className="v2-btn">Pričajmo</Link>
          <Link to="/programi" className="v2-btn v2-btn--ghost">
            Pogledaj programe
          </Link>
        </div>
        <span className="v2-hero__hint">skrolaj polako</span>
      </section>

      {/* ===== 2. MANIFEST ===== */}
      <section className="v2-manifest" ref={manifestRef}>
        {MANIFEST_LINES.map((line, i) => (
          <p className="v2-manifest__line" key={i}>{line}</p>
        ))}
      </section>

      {/* ===== 3. SLIKA U LUKU ===== */}
      <section className="v2-image">
        <div className="v2-image__arch">
          <img src="/hero-geo.jpg" alt="Psihogym savjetovalište" data-parallax />
        </div>
        <span className="v2-image__caption">psihogym — siguran prostor</span>
      </section>

      {/* ===== 4. PODRUČJA RADA — horizontalni pin ===== */}
      <section className="v2-podrucja" ref={pinRef}>
        <div className="v2-podrucja__sticky">
          <div className="v2-podrucja__head">
            <div>
              <span className="v2-label">( naš fokus )</span>
              <h2 className="v2-podrucja__title">Područja rada</h2>
            </div>
            <span className="v2-label">skrolaj — kartice putuju</span>
          </div>
          <div className="v2-podrucja__viewport">
            <div className="v2-podrucja__track" ref={trackRef}>
              {podrucja.map((item) => (
                <article className="v2-card" key={item.num}>
                  <div className="v2-card__num">{item.num}</div>
                  <div>
                    <h3 className="v2-card__title">{item.title.join(" ")}</h3>
                    <p className="v2-card__desc">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="v2-podrucja__progress">
            <span ref={progressRef} />
          </div>
        </div>
      </section>

      {/* ===== 5. BROJKE ===== */}
      <section className="v2-stats">
        {stats.map((s, i) => (
          <Stat key={i} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </section>

      {/* ===== 6. ISKUSTVA — sticky stack ===== */}
      <section className="v2-iskustva">
        <div className="v2-iskustva__head">
          <span className="v2-label">( iskustva klijenata )</span>
          <h2 className="v2-iskustva__title">Riječi koje griju</h2>
        </div>
        {quotes.map((q, i) => (
          <div className="v2-quote-step" key={i}>
            <figure
              className={`v2-quote ${i % 2 ? "v2-quote--tilt-r" : "v2-quote--tilt-l"}`}
            >
              <blockquote className="v2-quote__text">„{q.text}"</blockquote>
              <figcaption className="v2-quote__name">{q.name}</figcaption>
            </figure>
          </div>
        ))}
      </section>

      {/* ===== 7. CTA ===== */}
      <section className="v2-cta">
        <div className="v2-breath" aria-hidden="true" />
        <h2 className="v2-cta__title">
          Puno toga ti se vrti po glavi? <em>To je potpuno u redu.</em>
        </h2>
        <p className="v2-cta__sub">
          Sve što ti treba je malo privatnosti, stabilan internet — i možemo
          početi.
        </p>
        <Link to="/kontakt" className="v2-btn">Ispričaj svoju priču</Link>
      </section>
    </div>
  );
}
