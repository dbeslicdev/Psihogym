import { useEffect, useRef, useState } from "react";
import { Hero, Team, Facts, Myths, Fit, Closing } from "./PreviewContent.jsx";
import "./topics-preview.css";

const topics = [
  { id: "vazno", tab: "Važno je znati", Content: Facts },
  { id: "mitovi", tab: "Mitovi", Content: Myths },
  { id: "za-tebe", tab: "Kada nije za tebe", Content: Fit },
];
const topicFromHash = () => Math.max(0, topics.findIndex(t => "#"+t.id === location.hash));

export default function TopicPage() {
  const [selected, setSelected] = useState(topicFromHash);
  const buttons = useRef([]);
  useEffect(() => {
    const onHash = () => setSelected(topicFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  function changeTab(i) {
    setSelected(i);
    history.replaceState(null, "", "#"+topics[i].id);
  }
  function navigate(e,i) {
    let next = i;
    if(e.key==="ArrowLeft") next = (i+topics.length-1)%topics.length;
    else if(e.key==="ArrowRight") next = (i+1)%topics.length;
    else if(e.key==="Home") next = 0;
    else if(e.key==="End") next = topics.length-1;
    else return;
    e.preventDefault();
    changeTab(next);
    buttons.current[next]?.focus();
  }
  return <article className="topic-page">
    <div className="topic-intro"><header className="topic-mast"><Hero/></header>
      <section className="topic-team" id="timski-rad">
        <img src="/playground/ivana-portrait.webp" alt="Ivana Bešlić" width="950" height="1426"/>
        <div><Team/></div>
      </section>
    </div>
    <div className="topic-reading">
      <div className="topic-reader">
        <div className="topic-tabs" role="tablist" aria-label="Teme o savjetovanju">{topics.map(({id,tab},i)=>
          <button key={id} ref={el=>{buttons.current[i]=el;}} id={"tab-"+id} type="button" role="tab"
            aria-controls={id} aria-selected={i===selected} tabIndex={i===selected?0:-1}
            onClick={()=>changeTab(i)} onKeyDown={e=>navigate(e,i)}>{tab}</button>)}</div>
        {topics.map(({id,Content},i)=><section id={id} role="tabpanel" key={id}
          tabIndex={0} aria-labelledby={"tab-"+id} hidden={selected!==i} className="topic-panel"><Content/></section>)}
      </div>
    </div>
    <section id="kontakt" className="topic-closing"><Closing/></section>
  </article>;
}
