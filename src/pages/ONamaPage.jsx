import { useEffect, useRef, useState } from "react";
import useSectionEntrance from "../components/useSectionEntrance.js";
import useReviewStack from "../components/useReviewStack.js";
import { Link } from "react-router-dom";
import { SplitText, Curve, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

/* O MENI (ruta /o-meni) — v4 "Utočište" jezik: uvodna rečenica slovo-po-slovo, arch
   portret, dvostupčani prose, prvi val na "profesionalni put", CTA.
   Boje/tipografija iz globalnih tokena (--ps-*). */

const CAREER = [
  "Moj put prema savjetodavnom radu počinje studijem socijalne pedagogije na Edukacijsko-rehabilitacijskom fakultetu u Zagrebu. Ondje se upoznajem s transakcijskom analizom, psihoterapijskim pravcem koji mi daje konkretne alate za razumijevanje sebe i odnosa s drugima.",
  "S vremenom transakcijska analiza postaje moj osobni i profesionalni kompas. Vodi me i danas, u radu s ljudima i u svakodnevnom životu.",
  "Tijekom godina završavam različite edukacije i sudjelujem u nacionalnim i međunarodnim projektima. Iskustvo stječem radeći u osnovnoškolskom i visokom obrazovanju te u odgojnom savjetovalištu u Zagrebu.",
  "Nakon potresa u Zagrebu i pandemije vraćam se u rodnu Slavoniju i otvaram vlastitu praksu. U njoj povezujem sve što sam godinama učila, istraživala i gradila u radu s ljudima.",
];

export default function ONamaPage() {
  const careerRef = useRef(null);
  useReviewStack(careerRef);
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
              <img
                src="/ivana-o-meni.webp"
                alt="Ivana Bešlić, socijalna pedagoginja, specijalizantica psihoterapije"
                width="754"
                height="877"
                loading="eager"
              />
            </div>
          </div>
        </div>
        <div className="v4-ivana__tx">
          <SplitText as="h2" className="v4-ivana__name" active={portraitReady} delay={0.1} segments={[{ text: "Ivana Bešlić" }]} />
          <SplitText as="p" className="v4-ivana__role" active={portraitReady} delay={0.22} segments={[{ text: "Socijalna pedagoginja" }, { text: "specijalizantica psihoterapije", br: true }]} />
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

      {/* ===== 4. MOJ PROFESIONALNI PUT — odlomci kao bijele kartice koje se slažu
          jedna preko druge (isti mehanizam kao recenzije na naslovnici: useReviewStack). ===== */}
      <Curve color="#e2ecf1" className="v4-iskustva on-about-career" innerRef={careerRef} data-stop>
        <div className="v4-iskustva__head">
          <SplitText as="h2" className="v4-h2" delay={0.1} segments={[{ text: "Moj profesionalni put" }]} />
        </div>
        {CAREER.map((text) => (
          <div className={`v4-step${text.split(/\s+/).length > 30 ? " v4-step--long" : ""}`} key={text.slice(0, 24)}>
            <figure className="v4-stackcard pg-review--centered on-career-card">
              <blockquote>{text}</blockquote>
            </figure>
          </div>
        ))}
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

