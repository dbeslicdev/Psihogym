import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, useSearchParams } from "react-router-dom";
import "../../tokens.css";
import "../../index.css";
import "../../v4.css";
import "../../marketing.css";
import "../../premium.css";
import "../../responsive-audit.css";
import Footer from "../../components/Footer.jsx";
import "./preview.css";
import "./sand.css";

const designs = [
  { id: "A", name: "Kakao", color: "#614f46" },
  { id: "B", name: "Pijesak", color: "#d4c4b5" },
  { id: "C", name: "Kadulja", color: "var(--ps-sage-bg)" },
  { id: "D", name: "Magla", color: "var(--ps-mist)" },
  { id: "E", name: "Krem i glina", color: "var(--ps-terra)" },
];

const sandDesigns = [
  { id: "B1", name: "Potpis" },
  { id: "B2", name: "Jedan red" },
  { id: "B3", name: "Dva stupca" },
  { id: "B4", name: "Adresar" },
  { id: "B5", name: "Kontaktna traka" },
];

function FooterPreview() {
  const [params] = useSearchParams();
  const sand = sandDesigns.find(design => design.id === params.get("v"));
  const selected = sand ?? designs.find(design => design.id === params.get("v")) ?? designs[0];
  const layout = selected.id === "B5" ? "contact-strip" : sand ? "masthead" : "signature";
  return (
    <>
      <header className="fp-toolbar">
        <div className="fp-heading">
          <h1>{sand ? "Pijesak · raspored footera" : "Varijante footera"}</h1>
          {sand && <Link to="?v=B">← Izvorni Pijesak</Link>}
          {selected.id === "B" && <Link to="?v=B3">Pet novih rasporeda →</Link>}
        </div>
        <nav aria-label="Odaberi varijantu footera">
          {(sand ? sandDesigns : designs).map(({ id, name, color }) => (
            <Link key={id} to={'?v=' + id} aria-current={selected.id === id ? "true" : undefined}>
              {color && <i aria-hidden="true" style={{ backgroundColor: color }} />}{id} · {name}
            </Link>
          ))}
        </nav>
      </header>
      <main className="fp-context v4" aria-label="Završna sekcija naslovnice">
        <p>Puno toga ti se vrti po glavi?<span>To je potpuno u redu.</span></p>
        <a href="/kontakt" className="v4-btn">Ispričaj svoju priču <span className="cta-arrow" aria-hidden="true">↗</span></a>
      </main>
      <div className={sand ? "fp-design sand-layout" : "fp-design"} data-design={selected.id}><Footer reloadDocument layout={layout} /></div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<BrowserRouter><FooterPreview /></BrowserRouter>);
