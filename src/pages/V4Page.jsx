import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { podrucja, iskustva, programi } from "../data.js";
import {
  SplitText,
  Curve,
  reduceMotion,
  V4Shell,
  useCursorDepth,
  useBlobField,
  usePauseOffscreen,
} from "../v4/kit.jsx";
import HeroShapes from "../v4/HeroShapes.jsx";
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

const CHIP_STYLES = [
  { pos: "c1", color: "lavender", depth: 34, dur: "7s" },
  { pos: "c2", color: "blush", depth: -26, dur: "9s" },
  { pos: "c3", color: "sage", depth: 46, dur: "8s" },
  { pos: "c4", color: "cream", depth: -38, dur: "6.5s" },
  { pos: "c5", color: "blush", depth: 24, dur: "7.5s" },
  { pos: "c6", color: "lavender", depth: -30, dur: "8.5s" },
];

export default function V4Page() {
  const heroRef = useRef(null);
  const lineRef = useRef(null);
  const podrucjaRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  /* Ivanina linija: "crta se" slijeva nadesno kad sekcija uđe u viewport
     (stroke-dashoffset 1→0 uz pathLength="1"). Odigra jednom. */
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    if (reduceMotion()) {
      el.classList.add("is-drawn");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-drawn");
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Područja: chipovi SCROLL-VOĐENO ulaze/izlaze bočno. Svaki chip je
     "u fokusu" (--enterX 0) kad mu je centar blizu sredine ekrana, a
     gurnut izvan svoje strane (±OFF vw) kad je iznad/ispod. Zbog različitih
     vertikalnih pozicija: gornji par (c1/c2) uđe prvi, pa srednji (c3/c4),
     pa donji (c5/c6); scrollom dalje nestaju istim putem (reverse). */
  useEffect(() => {
    const section = podrucjaRef.current;
    if (!section) return;
    if (reduceMotion()) return; // chipovi ostaju vidljivi (--enterX 0)
    const chips = [...section.querySelectorAll("[data-depth]")];
    const OFF = 74; // vw izvan ruba
    const sideOf = (chip) =>
      chip.classList.contains("v4-chip--c2") ||
      chip.classList.contains("v4-chip--c4") ||
      chip.classList.contains("v4-chip--c6")
        ? 1
        : -1;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const center = vh / 2;
      // plateau: chip OSTAJE pun unutar ±hold od sredine (ne odskače),
      // pa se tek onda gasi preko fade → traje još "jedan scroll duže"
      const hold = vh * 0.3;
      const fade = vh * 0.45;
      chips.forEach((chip) => {
        const r = chip.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const d = Math.abs(cy - center);
        const p = Math.min(Math.max((hold + fade - d) / fade, 0), 1);
        chip.style.setProperty("--enterX", `${(sideOf(chip) * OFF * (1 - p)).toFixed(1)}vw`);
      });
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    const ctrl = new AbortController();
    window.addEventListener("scroll", onScroll, {
      passive: true,
      signal: ctrl.signal,
    });
    window.addEventListener("resize", onScroll, {
      passive: true,
      signal: ctrl.signal,
    });
    update();
    return () => ctrl.abort();
  }, []);

  /* Hero: polje oblika — svaki svojim smjerom/tempom, jače kod kursora.
     Područja: klasični cursor-depth (chipovi). Oba pišu --cx/--cy pa se
     komponiraju s bob/entrance transformima. */
  useBlobField(heroRef);
  useCursorDepth(podrucjaRef);

  /* Disanje oblika / bob oblačića stoje dok je sekcija izvan ekrana */
  usePauseOffscreen(heroRef);
  usePauseOffscreen(podrucjaRef);

  /* Programi: pinned horizontalna galerija + progress (iz v3) */
  useEffect(() => {
    const section = pinRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (reduceMotion() || window.matchMedia("(pointer: coarse)").matches) {
      section.classList.add("v4-programi--static");
      return;
    }
    const viewport = section.querySelector(".v4-programi__viewport");
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

  // 6. recenzija je duplikat 5. — koristimo 5 jedinstvenih
  const quotes = iskustva.slice(0, 5);

  return (
    <V4Shell>
      {/* ===== 1. HERO — Méline asimetrija + rotirajući prsten ===== */}
      <section className="v4-hero" data-bg="#faf6f0" ref={heroRef}>
        <div className="v4-hero__text">
          <SplitText
            as="h1"
            className="v4-hero__name"
            delay={0.1}
            segments={[{ text: "Psihogym" }]}
          />
          <SplitText
            as="p"
            className="v4-hero__role"
            delay={0.28}
            segments={[{ text: "Online psihosocijalno savjetovalište" }]}
          />
          {/* tag: cijeli fade lijevo→desno (mask-wipe, BEZ slovo-po-slovo),
              poravnat na kraj riječi "savjetovalište" */}
          <p className="v4-hero__tag">
            Za mlade i odrasle koji traže siguran prostor za razgovor i podršku
            u izazovnim životnim razdobljima.
          </p>
        </div>

        {/* organski oblici desno — svaki "diše" i prati kursor */}
        <HeroShapes className="v4-hero__shapes" />

        <span className="v4-hero__hint">skrolaj polako</span>
      </section>

      {/* ===== 2. EMPHASIS — tri velike rečenice ===== */}
      {/* Sve krem (kao hero), bez luka, isti font + Méline word-rise */}
      <section
        className="v4-emphasis v4-emphasis--flat v4-emphasis--intro"
        data-bg="#faf6f0"
      >
        <SplitText
          segments={[
            {
              text: "Mi smo online psihosocijalno savjetovalište za mlade i odrasle koji traže siguran prostor za razgovor i podršku u izazovnim životnim razdobljima.",
            },
          ]}
        />
      </section>
      <section className="v4-emphasis v4-emphasis--flat" data-bg="#faf6f0">
        <SplitText
          segments={[
            {
              text: "Svi imamo svoje kočnice. Savjetovanje nije samo za one koji pucaju po šavovima —",
            },
            { text: "već i za one koji žele više od sebe.", em: true },
          ]}
        />
      </section>
      {/* Tamna sekcija (kao Mélinin "Tout conjugue le verbe…"): podloga =
          boja glavnog teksta, tekst = krem. Luk gore je STATIČAN — valovit
          je, ali NE konzumira ništa. noMorph: bez data-bg, pa wrapper (i
          sekcije iznad, koje nemaju vlastitu podlogu) ostaju krem —
          inače bi u jednom trenutku cijeli viewport posmeđio. */}
      <Curve color="#5c3d29" className="v4-emphasis--dark" staticArc noMorph>
        <SplitText
          segments={[
            { text: "Svaki susret je poziv na upoznavanje sebe — tvojim tempom." },
          ]}
        />
        {/* CTA uz tekst — kao Mélinin "Découvrir ma pratique" */}
        <Link
          to="/savjetovanje"
          className="v4-btn v4-btn--serif v4-btn--invert reveal reveal--repeat"
        >
          Upoznaj naš pristup
        </Link>
      </Curve>

      {/* ===== 3. IVANA — arch slika, tekst ispod. OVA sekcija OBUZIMA
          tamnu iznad (svijetla podloga + smeđi tekst se dižu preko nje).
          consumeStart 0.62 → gutanje kreće ~2 scrolla kasnije (dimenzije
          tamne sekcije ostaju iste). */}
      <Curve color="#faf6f0" className="v4-ivana" consumeStart={0.62}>
        <div className="v4-ivana__media">
          {/* organska linija iza slike — "crta se" slijeva nadesno na ulazak */}
          <svg
            ref={lineRef}
            className="v4-ivana__line"
            viewBox="281 -1 1651 31"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M295.531 28.0893H1868.07C1886.59 28.0847 1904.78 23.2204 1920.83 13.9826C1923.74 12.1817 1931.04 8.45134 1929.88 4.07781C1928.72 -0.295722 1919.8 0.00436979 1917.01 0.00436979H344.513C325.995 0.00890726 307.804 4.87322 291.757 14.1111C288.883 15.9119 281.547 19.6423 282.705 24.0158C283.863 28.3893 292.784 28.3036 295.572 28.3036L295.531 28.0893Z"
              fill="#BCA28E"
            />
          </svg>
          <div className="v4-ivana__arch reveal">
            <img src="/hero-geo.jpg" alt="Ivana Bešlić" />
          </div>
        </div>
        <h2 className="v4-ivana__name reveal">Ivana Bešlić</h2>
        <p className="v4-ivana__bio reveal" data-delay="1">
          Magistra socijalne pedagogije i savjetovateljica u psihoterapiji.
          Vjerujem da svi možemo mijenjati ono što nam ne odgovara — u sebi,
          u odnosima i u svakodnevici. Kroz svoj rad pomažem ti prepoznati i
          zamijeniti obrasce koji ti više ne služe.
        </p>
      </Curve>

      {/* ===== 4. SIGN ===== */}
      <Curve color="#e4e0f4" className="v4-sign">
        <p className="reveal reveal--repeat">
          Jedan razgovor može donijeti više <em>lakoće, jasnoće i mira.</em>
        </p>
        <span className="v4-sign__sig reveal reveal--repeat">— Ivana</span>
        {/* CTA kao Mélinin "Prendre rendez-vous" */}
        <Link
          to="/kontakt"
          className="v4-btn v4-btn--serif reveal reveal--repeat"
        >
          Pričajmo
        </Link>
      </Curve>

      {/* ===== 5. PODRUČJA — floating chipovi + cursor ===== */}
      <Curve color="#faf6f0" className="v4-podrucja" innerRef={podrucjaRef}>
        <span className="v4-label">( naš fokus )</span>
        <h2 className="v4-podrucja__title">Područja u kojima te pratimo</h2>
        <div className="v4-podrucja__chips">
          {podrucja.map((item, i) => {
            const c = CHIP_STYLES[i];
            return (
              <div
                className={`v4-chip v4-chip--${c.color} v4-chip--${c.pos}`}
                data-depth={c.depth}
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

      {/* ===== 6. PROGRAMI — horizontalni pin ===== */}
      <Curve color="#f9eae8" className="v4-programi" innerRef={pinRef}>
        <div className="v4-programi__sticky">
          <div className="v4-programi__head">
            <div>
              <span className="v4-label">( online programi )</span>
              <h2 className="v4-h2">Rast tvojim tempom</h2>
            </div>
            <span className="v4-label">skrolaj — galerija putuje</span>
          </div>
          <div className="v4-programi__viewport">
            <div className="v4-programi__track" ref={trackRef}>
              <div className="v4-program v4-program--intro">
                <p className="v4-program__tagline">
                  Video lekcije, radni listovi i vođene vježbe — struktura
                  koja te nježno vodi kroz promjenu, kad tebi odgovara.
                </p>
                <Link
                  to="/programi"
                  className="v4-btn v4-btn--serif v4-program__cta"
                >
                  Pogledaj programe
                </Link>
              </div>
              {programi.map((p) => (
                <article className="v4-program" key={p.id}>
                  <div>
                    <div className="v4-program__meta">
                      <span className="v4-program__tag">{p.trajanje}</span>
                      <span className="v4-program__tag">{p.razina}</span>
                    </div>
                    <h3 className="v4-program__title">{p.title}</h3>
                    <p className="v4-program__tagline">{p.tagline}</p>
                  </div>
                  <div className="v4-program__foot">
                    <span className="v4-program__price">{p.cijenaEur} €</span>
                    <Link to="/programi" className="v4-btn v4-btn--ghost">
                      Saznaj više
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="v4-programi__progress">
            <span ref={progressRef} />
          </div>
        </div>
      </Curve>

      {/* ===== 7. ISKUSTVA — kartica PREKO kartice ===== */}
      <Curve color="#dde5d8" className="v4-iskustva">
        <div className="v4-iskustva__head">
          <span className="v4-label">( iskustva )</span>
          <h2 className="v4-h2">Riječi koje griju</h2>
        </div>
        {quotes.map((q, i) => (
          <div className="v4-step" key={i}>
            <figure className="v4-stackcard">
              <blockquote>
                „{q.text.length > 240 ? q.text.slice(0, 237) + "…" : q.text}"
              </blockquote>
              <figcaption>{q.name}</figcaption>
            </figure>
          </div>
        ))}
      </Curve>

      {/* ===== 8. CTA ===== */}
      <Curve color="#c9c3e6" className="v4-cta">
        <h2 className="v4-cta__title">
          Puno toga ti se vrti po glavi? <em>To je potpuno u redu.</em>
        </h2>
        <p className="v4-cta__sub">
          Sve što ti treba je malo privatnosti i stabilan internet — i možemo
          početi.
        </p>
        <Link to="/kontakt" className="v4-btn">Ispričaj svoju priču</Link>
      </Curve>
    </V4Shell>
  );
}
