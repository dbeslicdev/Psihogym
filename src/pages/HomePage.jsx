import { useEffect, useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import Typewriter from "../components/Typewriter.jsx";
import Counter from "../components/Counter.jsx";
import { podrucja, stats, iskustva } from "../data.js";

const ArrowIcon = ({ size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function HomePage() {
  const pinRef = useRef(null);
  const trackRef = useRef(null);

  /* Iskustva — pinned horizontalni scroll. Sekcija se zalijepi
     (position: sticky), a napredak vertikalnog scrolla kroz nju
     pomiče kartice ustranu. Radi uvijek dok prolaziš kroz sekciju,
     bez obzira gdje je kursor. Na touch/reduced-motion: nativni
     horizontalni swipe (klasa --static). */
  useEffect(() => {
    const section = pinRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) {
      section.classList.add("iskustva--static");
      return;
    }

    const viewport = section.querySelector(".iskustva__viewport");
    if (!viewport) return;
    let maxOffset = 0;

    const measure = () => {
      maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.height = `${window.innerHeight + maxOffset}px`;
    };

    const onScroll = () => {
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) {
        track.style.transform = "translateX(0)";
        return;
      }
      const scrolled = Math.min(
        Math.max(-section.getBoundingClientRect().top, 0),
        total,
      );
      const progress = scrolled / total;
      track.style.transform = `translateX(${(-progress * maxOffset).toFixed(2)}px)`;
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

  return (
    <>
      {/* ===== HERO (raspored po melissajanosek.com: tekst lijevo,
           portretna slika desno od nava do dna) ===== */}
      <header className="hero hero--mj">
        <div className="hero__grid">
          <div className="hero__text">
            <h1 className="hero__title reveal">
              Trebaš&nbsp;
              <Typewriter words={["razgovor?", "savjet?", "podršku?"]} />
            </h1>
            <p className="hero__sub reveal" data-delay="2">
              Mi smo online psihosocijalno savjetovalište za mlade i odrasle
              koji traže siguran prostor za razgovor i podršku u izazovnim
              životnim razdobljima.
            </p>
            <div className="hero__actions reveal" data-delay="3">
              <Link to="/kontakt" className="btn btn--dark">
                Pričajmo
                <ArrowIcon />
              </Link>
              <Link to="/programi" className="hero__actions-link">
                Pogledaj programe →
              </Link>
            </div>
          </div>
          <figure className="hero__figure reveal" data-delay="1">
            <img
              src="/hero-geo.jpg"
              alt="Psihogym savjetovalište"
              className="hero__img"
            />
          </figure>
        </div>
      </header>

      {/* ===== ŠTO TE SPRJEČAVA ===== */}
      <section className="section section--light" id="savjetovanje">
        <div className="split">
          <h2 className="split__title split__title--lg reveal">
            Što te sprječava <br />
            <em>u napretku?</em>
          </h2>
          <div className="split__body reveal" data-delay="1">
            <p>
              Svi imamo svoje kočnice. Savjetovanje nije samo za one koji pucaju
              po šavovima, već i za one koji žele više od sebe.
            </p>
            <Link to="/savjetovanje" className="btn btn--dark">
              Saznaj više
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PODRUČJA RADA ===== */}
      <section className="section section--dark podrucja">
        <h2 className="section__heading reveal">
          <span className="label">//01 — Naš fokus</span>Područja rada
        </h2>
        <ul className="podrucja__list">
          {podrucja.map((item) => (
            <li className="podrucja__row" key={item.num}>
              <span className="podrucja__num reveal reveal--repeat">
                {item.num}
              </span>
              <h3 className="podrucja__title reveal reveal--repeat">
                {item.title.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < item.title.length - 1 && <br />}
                  </span>
                ))}
              </h3>
              <p className="podrucja__desc reveal reveal--repeat">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== STATISTIKE (Nori "Why choose us" stil) ===== */}
      <section className="section section--dark stats" id="stats">
        <h2 className="section__heading reveal">
          <span className="label">//02 — U brojkama</span>Detalji koji
          <br />
          čine razliku
        </h2>
        <div className="stats__row">
          {stats.map((item, i) => (
            <Fragment key={i}>
              <div className="stats__cell">
                <Counter value={item.value} suffix={item.suffix} delay={i} />
                <span className="stats__label reveal" data-delay={i || undefined}>
                  {item.label}
                </span>
              </div>
              {i === 1 && <hr className="stats__divider" />}
            </Fragment>
          ))}
        </div>
      </section>

      {/* ===== ONLINE SAVJETOVANJE ===== */}
      <section className="section section--light">
        <div className="split">
          <h2 className="split__title split__title--lg reveal">
            Online <em>savjetovanje</em>
          </h2>
          <div className="split__body reveal" data-delay="1">
            <p>
              Bez obzira na lokaciju, tu smo za tebe. Dobivaš istu kvalitetu
              podrške kao i uživo, i to bez izlaska iz kuće. Sve što ti treba je
              stabilan internet, malo privatnosti i kamera – i možemo početi.
            </p>
          </div>
        </div>
      </section>

      {/* ===== ISKUSTVA KLIJENATA (pinned horizontalni scroll) ===== */}
      <section className="iskustva" id="iskustva" ref={pinRef}>
        <div className="iskustva__sticky">
          <h2 className="section__heading reveal">
            <span className="label">//03 — Recenzije</span>Iskustva klijenata
          </h2>
          <div className="iskustva__viewport">
            <div className="iskustva__track" ref={trackRef}>
              {iskustva.map((item, i) => (
                <figure className="iskustva__card" key={i}>
                  <blockquote>{item.text}</blockquote>
                  <figcaption>{item.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== KONTAKT CTA ===== */}
      <section className="cta" id="kontakt">
        <h2 className="cta__title reveal">
          Puno toga ti se <em>vrti po glavi?</em>
        </h2>
        <p className="cta__sub reveal" data-delay="1">
          To je potpuno u redu.
        </p>
        <Link
          to="/kontakt"
          className="btn btn--light btn--big reveal"
          data-delay="2"
        >
          Ispričaj svoju priču
          <ArrowIcon size={20} />
        </Link>
      </section>
    </>
  );
}
