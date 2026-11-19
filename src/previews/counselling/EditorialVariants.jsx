import { useEffect, useRef } from "react";
import { Hero, Team, Facts, Myths, Fit, Closing, JumpLinks } from "./PreviewContent.jsx";
import "./editorial.css";

export function Editorial() {
  return (
    <div className="sv-ed">
      <header className="sv-ed-cover sv-ed-width">
        <div className="sv-ed-cover-copy"><Hero /></div>
        <img src="/playground/conversation.webp" alt="Ivana Bešlić u razgovoru na savjetovanju" width="1300" height="867" />
      </header>
      <section id="timski-rad" className="sv-ed-team sv-ed-width">
        <Team />
      </section>
      <section id="vazno" className="sv-ed-facts">
        <div className="sv-ed-width"><Facts /></div>
      </section>
      <section id="mitovi" className="sv-ed-myths sv-ed-width"><Myths /></section>
      <section id="za-tebe" className="sv-ed-fit sv-ed-width"><Fit /></section>
      <section id="kontakt" className="sv-ed-close"><Closing /></section>
    </div>
  );
}

export function Guide() {
  const guide = useRef(null);

  useEffect(() => {
    const host = guide.current;
    const sections = [...host.querySelectorAll(".sv-guide-body section[id]")];
    const links = [...host.querySelectorAll(".sv-guide-nav a[href*='#']")];
    const menu = host.querySelector(".sv-guide-mobile-nav");
    let frame = 0;
    let currentId;

    const update = () => {
      frame = 0;
      const boundary = Math.max(125, window.innerHeight * 0.28);
      const reached = sections.filter(section => section.getBoundingClientRect().top <= boundary);
      const activeId = reached.at(-1)?.id;
      if (activeId === currentId) return;
      currentId = activeId;
      for (const link of links) {
        if (link.hash === "#" + activeId) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const closeMenu = event => {
      if (event.target.closest("a[href]")) menu.open = false;
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(host);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    menu.addEventListener("click", closeMenu);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      menu.removeEventListener("click", closeMenu);
    };
  }, []);

  return (
    <div className="sv-guide" ref={guide}>
      <div className="sv-guide-shell">
        <aside className="sv-guide-nav">
          <div className="sv-guide-desktop-nav">
            <p>Sadržaj stranice</p><JumpLinks />
          </div>
          <details className="sv-guide-mobile-nav">
            <summary>Sadržaj stranice</summary><JumpLinks />
          </details>
        </aside>
        <div className="sv-guide-body">
          <header className="sv-guide-intro"><Hero /></header>
          <section id="timski-rad" className="sv-guide-team"><Team /></section>
          <section id="vazno" className="sv-guide-facts"><Facts /></section>
          <section id="mitovi" className="sv-guide-myths"><Myths /></section>
          <section id="za-tebe" className="sv-guide-fit"><Fit /></section>
          <section id="kontakt" className="sv-guide-close"><Closing /></section>
        </div>
      </div>
    </div>
  );
}

