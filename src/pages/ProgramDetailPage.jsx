import { useEffect, useRef } from "react";
import { setupAccordions } from "./accordion.js";
import { Link, useParams } from "react-router-dom";
import { programi, programiById } from "../data.js";
import { addToCart, isPurchased, useCartItems } from "../cart.js";
import { Curve, SplitText, V4Shell } from "../v4/kit.jsx";
import { programIdentity } from "../components/ProgramArtwork.jsx";
import ProgramConcept from "../components/ProgramConcept.jsx";
import ProgramPreviewCard from "../components/ProgramPreviewCard.jsx";
import useSectionEntrance from "../components/useSectionEntrance.js";
import "./program-experience.css";

// Završna poruka svakog programa (iznad gumba za kupnju).
const closingLines = {
  // Niz = ručni prijelom: dio s br: true ide u novi red.
  "emocionalni-razvoj": [{ text: "Poslušaj što ti" }, { text: "emocije govore", br: true }],
  anksioznost: [{ text: "Zamijeni „što ako“" }, { text: "sa „što mogu“", br: true }],
  stres: "Kreni od „moram“ prema „biram“",
  odnosi: "Stvori odnose u kojima možeš disati",
  samopouzdanje: "Budi na svojoj strani",
};
const closingSegments = id => {
  const line = closingLines[id] || "Počni svojim tempom";
  return Array.isArray(line) ? line : [{ text: line }];
};

function ModuleOutline({ module }) {
  return (
    // Ista data-accordion grupa = harmonika: otvaranjem jednog zatvaraju se ostali.
    <details data-accordion="module">
      <summary>
        <span className="pd-module-num">{module.id.slice(1).padStart(2, "0")}</span>
        <span>{module.title}</span>
        <span className="pd-module-plus" aria-hidden="true">+</span>
      </summary>
      <div className="pd-module-body">
        <p className="pd-module-intro">{module.description}</p>
        <ul className="pd-lesson-list">
          {module.lessons.map(lesson => {
            const index = <span className="pd-lesson-index">
              {lesson.type === "video" ? lesson.id.slice(1).padStart(2, "0") : lesson.type === "bonus" ? "Bonus" : "Osvrt"}
            </span>;
            return <li key={lesson.id}>
              {lesson.description
                ? <details className="pd-lesson" data-accordion={"lesson-" + module.id}>
                    <summary>{index}<span className="pd-lesson-title">{lesson.title}</span><span className="pd-lesson-plus" aria-hidden="true">+</span></summary>
                    <p className="pd-lesson-goal">{lesson.description}</p>
                  </details>
                : <div className="pd-lesson">{index}<span className="pd-lesson-title">{lesson.title}</span></div>}
            </li>;
          })}
        </ul>
      </div>
    </details>
  );
}

export default function ProgramDetailPage() {
  const { programId } = useParams();
  const program = programiById[programId];
  const heroRef = useRef(null);
  const cart = useCartItems();
  const heroReady = useSectionEntrance(heroRef, ".pd-intro", .9);
  // Moduli, lekcije i pitanja: harmonika s mekim otvaranjem (vidi accordion.js).
  useEffect(setupAccordions, []);
  if (!program) return <V4Shell className="marketing-page pg-playground pg-premium"><section className="pd-missing"><span className="pg-eyebrow">Program nije pronađen</span><h1>Pronađi svoj sljedeći korak.</h1><Link to="/programi" className="v4-btn">Svi programi<span className="cta-arrow" aria-hidden="true">↗</span></Link></section></V4Shell>;

  const identity = programIdentity(program);
  const programIndex = programi.findIndex(item => item.id === program.id);
  const arrow = <span className="cta-arrow" aria-hidden="true">↗</span>;
  const buy = isPurchased(program.id)
    ? <Link to={"/app/program/" + program.id} className="v4-btn">Otvori svoj program {arrow}</Link>
    : cart.includes(program.id)
      ? <Link to="/kosarica" className="v4-btn">Idi u košaricu {arrow}</Link>
      : <button type="button" className="v4-btn" onClick={() => addToCart(program.id)}>Dodaj u košaricu {arrow}</button>;
  const questions = [
    ["Kako program funkcionira?", program.operation],
    ["Koliko traje i koliko dugo imaš pristup?", [
      program.duration,
      // "XXX" = trajanje još nije poznato; crveno da se vidi što treba doraditi.
      program.videoLength && <>Trajanje pojedine videolekcije je {program.videoLength === "XXX"
        ? <span className="pd-todo">XXX</span> : program.videoLength}.</>,
      program.access,
    ].filter(Boolean)],
    ["Na čemu se program temelji?", [program.basis]],
    ["Kome program nije namijenjen?", [program.unsuitable]],
  ];
  return <V4Shell className="marketing-page pg-playground pg-premium pg-detail" data-editorial-waves>
    <section className="pd-hero" ref={heroRef} data-ready={heroReady} data-stop data-bg="#fbf5ec">
      <nav className="pd-breadcrumb" aria-label="Putanja"><Link to="/programi">Programi</Link><span aria-hidden="true">/</span><span>{identity.title}</span></nav>
      <div className="pd-hero-grid">
        <div className={"pd-art-stage pd-brand-art pc-palette--" + (programIndex + 1)} aria-hidden="true">
          <div className="pd-brand-art__surface"><ProgramConcept id={program.id} /></div>
        </div>
        <div className="pd-intro">
          <span className="pg-eyebrow">Online program / {identity.number}</span>
          <SplitText as="h1" active={heroReady} delay={.1} segments={[{ text: program.title }]} />
          <SplitText as="p" className="pd-tagline" active={heroReady} delay={.2} stagger={.0035} duration={.28} segments={[{ text: program.description }]} />
          <dl className="pd-facts">
            {/* Brojke su naglašene (veće od riječi uz njih) kao glavni podatak o programu. */}
            <div><dt>Trajanje</dt><dd><span className="pd-fact-num">{program.days}</span> {program.trajanje.replace(/^\d+\s*/, "")}</dd></div>
            <div><dt>Videolekcije</dt><dd><span className="pd-fact-num">{program.videoCount}</span>{program.bonusCount > 0 && <small> + bonus</small>}</dd></div>
            <div><dt>Pristup od kupnje</dt><dd><span className="pd-fact-num">{program.accessDays}</span> dana</dd></div>
          </dl>
          <div className="pd-purchase">
            <div><span className="pg-eyebrow">{program.cijenaEur < program.price ? "Početna cijena" : "Cijena programa"}</span><strong>{program.cijenaEur < program.price && <del>{program.price} €</del>} {program.cijenaEur} €</strong></div>
            {buy}
          </div>
          <a href="#sadrzaj" className="pg-text-link">Pogledaj sadržaj <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
    <section className="pd-overview" data-stop data-bg="#fbf5ec">
      <div className="pd-overview-grid" data-wave-content>
        <SplitText as="h2" delay={.1} segments={[{ text: "Je li ovaj program za tebe?" }]} />
        <p>{program.audience}</p>
      </div>
    </section>
    <Curve className="pd-content" id="sadrzaj" data-stop color="#e2ecf1">
      <div className="pd-content-grid" data-wave-content>
        <div>
          <SplitText as="h2" delay={.1} segments={[{ text: "Koje te lekcije očekuju?" }]} />
          <p className="pd-section-lead">{program.activities}</p>
          <div className="pd-modules">{program.modules.map(module =>
            <ModuleOutline key={module.id} module={module} />
          )}</div>
        </div>
        <aside className="pd-included" aria-labelledby="pd-included-heading">
          <h3 id="pd-included-heading">Što dobivaš?</h3>
          <ul>{program.benefits.map(item => <li key={item}>{item}</li>)}</ul>
          {program.benefitsNote && <p className="pd-included-note">{program.benefitsNote}</p>}
          <Link to="/kontakt" className="pg-text-link">Imaš pitanje? Javi mi se {arrow}</Link>
        </aside>
      </div>
    </Curve>
    <Curve className="pd-materials" data-stop color="#fbf5ec">
      <div className="pd-material-copy" data-wave-content><SplitText as="h2" delay={.1} segments={[{ text: "O sudjelovanju" }]} /></div>
      <div className="pd-modules pd-questions" data-wave-content>
        {questions.map(([title, paragraphs]) => (
          <details key={title} data-accordion="question">
            <summary><span>{title}</span><span className="pd-module-plus" aria-hidden="true">+</span></summary>
            <div className="pd-question-body">{paragraphs.map((text, index) => <p key={index}>{text}</p>)}</div>
          </details>
        ))}
      </div>
    </Curve>
    <Curve className="pd-closing" data-stop color="#e4d9cd">
      <div data-wave-content><SplitText as="h2" delay={.1} segments={closingSegments(program.id)} />
        <p>{identity.title} · {program.trajanje} · {program.cijenaEur} €</p>
      </div>
      <div data-wave-content>{buy}</div>
    </Curve>
    <Curve className="pd-related pg-original-programs" color="#fbf5ec" data-stop data-program-cards="true" aria-labelledby="pd-related-title">
      <div id="pd-related-title" data-wave-content><SplitText as="h2" delay={.1} segments={[{ text: "Istraži druge programe" }]} /></div>
      <div className="pd-related-grid" data-wave-content>{programi.filter(p => p.id !== program.id).map(p => <ProgramPreviewCard key={p.id} program={p} index={programi.findIndex(item => item.id === p.id)} />)}</div>
    </Curve>
  </V4Shell>;
}
