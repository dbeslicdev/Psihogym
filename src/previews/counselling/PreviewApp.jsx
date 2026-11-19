import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../tokens.css";
import "./preview.css";
import { Editorial, Guide } from "./EditorialVariants.jsx";
import { Dialogue, Notebook } from "./DialogueVariants.jsx";
import TopicPage from "./TopicPage.jsx";

const designs = [
  { title: "Urednički prijelom", Page: Editorial },
  { title: "Vodič uz rub", Page: Guide },
  { title: "Razgovor u parovima", Page: Dialogue },
  { title: "Otvorena bilježnica", Page: Notebook },
  { title: "Odaberi temu", Page: TopicPage },
];

function readChoice() {
  const query = new URLSearchParams(location.search);
  const value = Number(query.get("smjer"));
  return {
    index: Number.isInteger(value) && value >= 1 && value <= designs.length ? value - 1 : 0,
    phone: query.get("sirina") === "mobitel",
  };
}

function SiteHeader() {
  return <header className="sample-header"><a className="sample-wordmark" href="/" target="_top" aria-label="Psihogym, naslovnica">psihogym.</a>
    <div className="sample-header-actions">
      <a href="/kosarica" target="_top" aria-label="Košarica"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 3h3l2.4 11.1a2 2 0 0 0 2 1.6h9.3a2 2 0 0 0 2-1.6l1.2-7.3H6"/><circle cx="10" cy="20" r=".8"/><circle cx="18" cy="20" r=".8"/></svg></a>
      <details className="sample-menu"><summary aria-label="Izbornik"><span></span><span></span></summary><nav aria-label="Glavna navigacija">
        {[["Naslovnica","/"],["O nama","/o-nama"],["Savjetovanje","/savjetovanje"],["Programi","/programi"],["Kontakt","/kontakt"]].map(([name,href])=><a key={href} href={href} target="_top">{name}</a>)}
      </nav></details>
    </div></header>;
}

function Canvas({index}) {
  const {title, Page} = designs[index];
  useEffect(() => { document.title = title + " · Savjetovanje"; }, [title]);
  return <div className="preview-page"><SiteHeader/><main><Page/></main><footer className="sample-footer"><a href="/" className="sample-wordmark" target="_top">psihogym.</a><a href="mailto:info@psihogym.hr">info@psihogym.hr</a></footer></div>;
}

function Compare() {
  const [choice,setChoice] = useState(readChoice);
  const {index, phone} = choice;
  useEffect(() => {
    const restore = () => setChoice(readChoice());
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  function select(next, compact) {
    const url = new URL(location.href);
    url.searchParams.set("smjer", String(next + 1));
    if (compact) url.searchParams.set("sirina", "mobitel"); else url.searchParams.delete("sirina");
    if (url.href !== location.href) history.pushState(null, "", url);
    setChoice({index: next, phone: compact});
  }
  return <div className="compare">
    <header className="chooser"><div className="chooser-tools">
      <h1>Savjetovanje <span>/</span> Prijedlozi</h1>
      <div className="device-switch" role="group" aria-label="Širina pregleda">
        <button aria-pressed={!phone} onClick={()=>select(index,false)}>Puna širina</button>
        <button aria-pressed={phone} onClick={()=>select(index,true)}>Mobitel</button></div>
      <a className="original-link" href="/savjetovanje">Sadašnja stranica ↗</a>
    </div><nav className="design-switch" aria-label="Prijedlozi dizajna">
      {designs.map(({title}, i)=><button key={title} type="button" aria-pressed={i===index} onClick={()=>select(i,phone)}><span>{i+1}</span>{title}</button>)}
    </nav>
    <select className="design-select" aria-label="Prijedlog dizajna" value={index} onChange={e=>select(Number(e.target.value),phone)}>{designs.map(({title}, i)=><option key={title} value={i}>{i+1}. {title}</option>)}</select>
    </header>
    <div className="preview-desk" data-phone={phone}><iframe key={index} title={"Savjetovanje · "+designs[index].title} src={"?stranica=1&smjer="+(index+1)} /></div>
  </div>;
}
const canvas = new URLSearchParams(location.search).has("stranica");
createRoot(document.getElementById("root")).render(canvas ? <Canvas index={readChoice().index}/> : <Compare/>);
