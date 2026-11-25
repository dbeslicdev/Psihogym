import { useEffect, useRef, useState } from "react";
import useSectionEntrance from "../components/useSectionEntrance.js";
import { Link } from "react-router-dom";
import { SplitText, Curve, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

/* O MENI (ruta /o-meni) — v4 "Utočište" jezik: uvodna rečenica slovo-po-slovo, arch
   portret, dvostupčani prose, prvi val na "profesionalni put", CTA.
   Boje/tipografija iz globalnih tokena (--ps-*). */
const ABOUT_PHOTOS = ["/ivana-o-meni-1.jpg", "/ivana-o-meni-2.jpg"];
const PHOTO_INTERVAL_MS = 7000;

export default function ONamaPage() {
  const [careerParagraph, setCareerParagraph] = useState(0);
  const careerBodyRef = useRef(null);
  useEffect(() => {
    const paragraphs = Array.from(careerBodyRef.current.children);
    // A restored scroll position can enter halfway through this sequence.
    // Resume from the first visible paragraph, then reveal the rest in order.
    const observer = new IntersectionObserver(() => {
      const index = paragraphs.findIndex((paragraph) => {
        const rect = paragraph.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      if (index > 0) setCareerParagraph((current) => Math.max(current, index));
    });
    paragraphs.forEach((paragraph) => observer.observe(paragraph));
    return () => observer.disconnect();
  }, []);
  // Dvije fotografije se izmjenjuju svakih 7 s (privremeno, za odabir bolje).
  const [photo, setPhoto] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setPhoto((current) => (current + 1) % ABOUT_PHOTOS.length), PHOTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
  const portraitRef = useRef(null);
  const closingRef = useRef(null);
  const closingReady = useSectionEntrance(closingRef, ".v4-cta__title", .85);
  const portraitReady = useSectionEntrance(portraitRef, ".v4-ivana__media", .9);
  return (
    <V4Shell className="marketing-page pg-playground pg-premium pg-about" data-editorial-waves>
      {/* ===== 1. SUBHERO — velika uvodna rečenica, slovo po slovo ===== */}
      <section className="on-hero" data-bg="#fbf5ec" data-stop>
        <span className="v4-label">O MENI</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Tko je s druge strane ekrana?",
            },
          ]}
        />
      </section>

      {/* About portrait has its own silhouette and an earlier entrance. */}
      <section className="v4-ivana pg-ivana-late on-about-profile" data-bg="#fbf5ec" ref={portraitRef} data-stop>
        <div className="v4-ivana__media">
          <div className="pg-ivana-frame">
            <div className="pg-ivana-backdrop" aria-hidden="true"><div className="pg-ivana-backdrop-shape" /></div>
            <div className="pg-ivana-image on-about-photos">
              {ABOUT_PHOTOS.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={index === photo ? "Ivana Bešlić, socijalna pedagoginja i specijalizantica psihoterapije" : ""}
                  aria-hidden={index === photo ? undefined : true}
                  data-active={index === photo}
                  width="1000"
                  height="1500"
                  loading="eager"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="v4-ivana__tx">
          <SplitText as="h2" className="v4-ivana__name" active={portraitReady} delay={0.1} segments={[{ text: "Ivana Bešlić" }]} />
          <SplitText as="p" className="v4-ivana__role" active={portraitReady} delay={0.22} segments={[{ text: "Socijalna pedagoginja i specijalizantica psihoterapije" }]} />
          <div className="on-about-intro">
            <SplitText as="p" active={portraitReady} delay={0.34} segments={[{ text: "Ja sam Ivana. Prije svega sam supruga, majka jedne djevojčice i cjeloživotna učenica. Svoje znanje i iskustvo povezujem u integrativan i razumljiv način rada. U osjetljivim životnim razdobljima mladima i odraslima nudim jasna objašnjenja, primjenjive alate i toplu podršku." }]} />
          </div>
          <Link to="/kontakt" className="v4-btn pg-sequence-cta"><span>Pričajmo</span><span className="cta-arrow" aria-hidden="true">↗</span></Link>
        </div>
      </section>

      {/* ===== 3. MOJ PRISTUP — dvostupčano (krem) ===== */}
      <section className="on-prose on-about-belief reading-exit" data-bg="#fbf5ec" data-stop>
        <SplitText as="h2" className="on-prose__title" delay={0.1} segments={[{ text: "Moj pristup" }]} />
        <div className="on-prose__body" data-wave-content>
          <SplitText as="p" delay={0.22} segments={[{ text: "Vjerujem da promjena počinje razumijevanjem. Zato zajedno istražujemo obrasce razmišljanja i ponašanja koji te koče i tražimo nove koji te pokreću." }]} />
        </div>
      </section>

      {/* ===== 4. MOJ PROFESIONALNI PUT — prvi VAL (sage-soft) ===== */}
      <Curve color="#e2ecf1" className="on-prose on-prose--curve on-about-career reading-exit" data-stop>
        <SplitText as="h2" className="on-prose__title" delay={0.1} segments={[{ text: "Moj profesionalni put" }]} />
        <div className="on-prose__body" ref={careerBodyRef} data-wave-content>
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28}  onComplete={() => setCareerParagraph((current) => Math.max(current, 1))} segments={[{ text: "Moj put prema savjetodavnom radu počinje studijem socijalne pedagogije na Edukacijsko-rehabilitacijskom fakultetu u Zagrebu. Ondje se upoznajem s transakcijskom analizom, psihoterapijskim pravcem koji mi daje konkretne alate za razumijevanje sebe i odnosa s drugima." }]} />
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28} active={careerParagraph >= 1 ? true : false} onComplete={() => setCareerParagraph((current) => Math.max(current, 2))} segments={[{ text: "S vremenom transakcijska analiza postaje moj osobni i profesionalni kompas. Vodi me i danas, u radu s ljudima i u svakodnevnom životu." }]} />
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28} active={careerParagraph >= 2 ? true : false} onComplete={() => setCareerParagraph((current) => Math.max(current, 3))} segments={[{ text: "Tijekom godina završavam različite edukacije i sudjelujem u nacionalnim i međunarodnim projektima. Iskustvo stječem radeći u osnovnoškolskom i visokom obrazovanju te u odgojnom savjetovalištu u Zagrebu." }]} />
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28} active={careerParagraph >= 3 ? true : false} onComplete={() => setCareerParagraph((current) => Math.max(current, 4))} segments={[{ text: "Nakon potresa u Zagrebu i pandemije vraćam se u rodnu Slavoniju i otvaram vlastitu praksu. U njoj povezujem sve što sam godinama učila, istraživala i gradila u radu s ljudima." }]} />
        </div>
      </Curve>

      {/* ===== 5. CTA — lavanda finale ===== */}
      <Curve color="#e4d9cd" className="v4-cta" consumeStart={0.55} data-center-wave data-stop innerRef={closingRef}>
        <SplitText as="h2" className="v4-cta__title" delay={0.1} active={closingReady} segments={[{ text: "Kako želiš krenuti?" }]} />
        <div className="on-cta__row on-about-cta-sequence">
          <Link to="/programi" className="v4-btn">
            Programi
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
          <Link to="/savjetovanje" className="v4-btn v4-btn--ghost">
            Individualni rad
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
        </div>
      </Curve>
    </V4Shell>
  );
}

