import { useEffect, useRef, useState } from "react";
import useSectionEntrance from "../components/useSectionEntrance.js";
import { Link } from "react-router-dom";
import { SplitText, Curve, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

/* O NAMA — v4 "Utočište" jezik: uvodna rečenica slovo-po-slovo, arch
   portret, dvostupčani prose, prvi val na "profesionalni put", CTA.
   Boje/tipografija iz globalnih tokena (--ps-*). */
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
  const portraitRef = useRef(null);
  const closingRef = useRef(null);
  const closingReady = useSectionEntrance(closingRef, ".v4-cta__title", .85);
  const portraitReady = useSectionEntrance(portraitRef, ".v4-ivana__media", .9);
  return (
    <V4Shell className="marketing-page pg-playground pg-premium pg-about" data-editorial-waves>
      {/* ===== 1. SUBHERO — velika uvodna rečenica, slovo po slovo ===== */}
      <section className="on-hero" data-bg="#fbf5ec" data-stop>
        <span className="v4-label">O NAMA</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Iskustvo, znanje i pristup prilagođen tebi.",
            },
          ]}
        />
      </section>

      {/* About portrait has its own silhouette and an earlier entrance. */}
      <section className="v4-ivana pg-ivana-late on-about-profile" data-bg="#fbf5ec" ref={portraitRef} data-stop>
        <div className="v4-ivana__media">
          <div className="pg-ivana-frame">
            <div className="pg-ivana-backdrop" aria-hidden="true"><div className="pg-ivana-backdrop-shape" /></div>
            <div className="pg-ivana-image">
              <img src="/ivana_mitric2.jpg" alt="Ivana Bešlić, savjetodavna terapeutkinja" loading="eager" fetchPriority="high" />
            </div>
          </div>
        </div>
        <div className="v4-ivana__tx">
          <SplitText as="h2" className="v4-ivana__name" active={portraitReady} delay={0.1} segments={[{ text: "Ivana Bešlić" }]} />
          <SplitText as="p" className="v4-ivana__role" active={portraitReady} delay={0.22} segments={[{ text: "Magistra socijalne pedagogije i savjetodavna terapeutkinja" }]} />
          <div className="on-about-intro">
            <SplitText as="p" active={portraitReady} delay={0.34} segments={[{ text: "Ja sam Ivana Bešlić, magistra socijalne pedagogije i savjetodavna terapeutkinja. Prije svega sam supruga, majka jedne divne djevojčice i cjeloživotna učenica." }]} />
          </div>
          <Link to="/kontakt" className="v4-btn pg-sequence-cta"><span>Pričajmo</span><span className="cta-arrow" aria-hidden="true">↗</span></Link>
        </div>
      </section>

      {/* ===== 3. NEKOLIKO RIJEČI O MENI — bio, dvostupčano (krem) ===== */}
      <section className="on-prose on-about-belief reading-exit" data-bg="#fbf5ec" data-stop>
        <SplitText as="h2" className="on-prose__title" delay={0.1} segments={[{ text: "Nekoliko riječi o meni" }]} />
        <div className="on-prose__body" data-wave-content>
          <SplitText as="p" delay={0.22} segments={[{ text: "Vjerujem da svi možemo mijenjati ono što nam ne odgovara — u sebi, u odnosima i u svakodnevnici. Zato ti kroz svoj rad pomažem prepoznati, razumjeti i zamijeniti obrasce ponašanja i razmišljanja koji ti više ne služe — s onima koji ti služe." }]} />
        </div>
      </section>

      {/* ===== 4. MOJ PROFESIONALNI PUT — prvi VAL (sage-soft) ===== */}
      <Curve color="#e2ecf1" className="on-prose on-prose--curve on-about-career reading-exit" data-stop>
        <SplitText as="h2" className="on-prose__title" delay={0.1} segments={[{ text: "Moj profesionalni put" }]} />
        <div className="on-prose__body" ref={careerBodyRef} data-wave-content>
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28}  onComplete={() => setCareerParagraph((current) => Math.max(current, 1))} segments={[{ text: "Moj put prema savjetodavnom radu započeo je studijem socijalne pedagogije na Edukacijsko-rehabilitacijskom fakultetu u Zagrebu, gdje se ubrzo upoznajem s transakcijskom analizom — psihoterapijskim pravcem koji mi daje konkretne alate za razumijevanje sebe i odnosa s drugima." }]} />
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28} active={careerParagraph >= 1 ? true : false} onComplete={() => setCareerParagraph((current) => Math.max(current, 2))} segments={[{ text: "S vremenom TA postaje moj osobni i profesionalni kompas — nešto što me i danas vodi u radu s ljudima, ali i u svakodnevnom životu." }]} />
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28} active={careerParagraph >= 2 ? true : false} onComplete={() => setCareerParagraph((current) => Math.max(current, 3))} segments={[{ text: "Kroz godine završavam različite edukacije, sudjelujem u nacionalnim i međunarodnim projektima te svoje znanje i iskustvo razvijam kroz rad u osnovnoškolskom i visokom obrazovanju, kao i u odgojnom savjetovalištu u Zagrebu." }]} />
          <SplitText as="p" delay={0} stagger={0.0035} duration={0.28} active={careerParagraph >= 3 ? true : false} onComplete={() => setCareerParagraph((current) => Math.max(current, 4))} segments={[{ text: "Nakon potresa u Zagrebu i pandemije vraćam se u rodnu Slavoniju i otvaram vlastitu savjetodavnu praksu — mjesto u kojem povezujem sve ono što sam kroz godine učila, istraživala i gradila kroz rad s ljudima." }]} />
        </div>
      </Curve>

      {/* ===== 5. CTA — lavanda finale ===== */}
      <Curve color="#e4d9cd" className="v4-cta" consumeStart={0.55} data-center-wave data-stop innerRef={closingRef}>
        <SplitText as="h2" className="v4-cta__title" delay={0.1} active={closingReady} segments={[{ text: "Želiš saznati više?" }]} />
        <div className="on-cta__row on-about-cta-sequence">
          <Link to="/savjetovanje" className="v4-btn">
            Savjetovanje
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
          <Link to="/kontakt" className="v4-btn v4-btn--ghost">
            Kontakt
          <span className="cta-arrow" aria-hidden="true">↗</span></Link>
        </div>
      </Curve>
    </V4Shell>
  );
}

