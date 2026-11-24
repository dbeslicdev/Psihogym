import { useId, useLayoutEffect, useRef, useState } from "react";
import ProgramBenefits from "./ProgramBenefits.jsx";

export default function ProgramCard({ program, className, id, delay, titleClassName, titleHeadingLevel = "h3", beforeTitle, artwork, titleAside, children, footer }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const suppressFocus = useRef(false);
  const bodyRef = useRef(null);
  const titleRef = useRef(null);
  const Title = titleHeadingLevel;
  const keyboardFocusInside = (card) => card.contains(document.activeElement) && document.activeElement.matches(":focus-visible");

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const title = titleRef.current;
    // Layout coordinates stay stable while the heading itself is transformed.
    const measure = () => {
      let top = 0;
      for (let element = title; element && element !== body; element = element.offsetParent) top += element.offsetTop;
      const fontSize = parseFloat(getComputedStyle(title).fontSize);
      const scale = Math.min(1, Math.max(20, Math.min(24, fontSize * 0.6)) / fontSize);
      body.style.setProperty("--program-title-rise", -top + "px");
      body.style.setProperty("--program-title-scale", scale);
      const benefitsGap = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (body.closest(".pg-original-programs")) {
        // Scaling alone preserves the original line breaks. Give the heading
        // its full visual width before measuring the compact hover layout.
        const visualWidth = program.id === "odnosi"
          ? Math.min(body.clientWidth - (artwork ? 76 : 0), 280) : body.clientWidth - (artwork ? 76 : 0);
        const hoverWidth = visualWidth / scale;
        const preview = title.cloneNode(true);
        preview.setAttribute("aria-hidden", "true");
        Object.assign(preview.style, {
          position: "absolute", width: hoverWidth + "px", maxWidth: "none",
          height: "auto", transform: "none", visibility: "hidden", margin: "0",
        });
        body.append(preview);
        const hoverHeight = Math.ceil(preview.offsetHeight * scale);
        preview.remove();
        body.style.setProperty("--program-hover-title-width", hoverWidth + "px");
        body.style.setProperty("--program-title-space", hoverHeight + benefitsGap + "px");
        const benefits = body.querySelector(".program-benefits");
        body.style.setProperty("--program-hover-height", hoverHeight + benefitsGap + (benefits?.scrollHeight || 0) + 12 + "px");
      } else {
        body.style.setProperty("--program-title-space", Math.ceil(title.offsetHeight * scale) + benefitsGap + "px");
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    // The visible heading changes width while it animates. Only its resting
    // geometry can change the space the card needs.
    const reserve = body.querySelector(".program-reveal__title-reserve");
    observer.observe(body.closest(".pg-original-programs") ? reserve : title);
    document.fonts.ready.then(() => { if (body.isConnected) measure(); });
    return () => observer.disconnect();
  }, [program.title, artwork != null]);

  return (
    <article id={id} className={className + " program-reveal"} data-expanded={expanded}
      data-delay={delay} tabIndex={0} aria-label={program.title}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) setExpanded(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse" && !keyboardFocusInside(event.currentTarget)) setExpanded(false);
      }}
      onFocus={(event) => {
        if (suppressFocus.current) return;
        if (!event.target.closest(".program-reveal__toggle") && event.target.matches(":focus-visible")) setExpanded(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
      onClick={(event) => {
        // Cijela kartica vodi na program kao i "Saznaj više" (mišem i dodirom).
        // Pravi link ostaje gumb, pa čitač ekrana i tipkovnica rade kao i prije.
        const card = event.currentTarget;
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.target.closest("a, button, input, select, textarea, label, [role='button']")) return;
        if (String(window.getSelection?.() ?? "").trim()) return; // označavanje teksta nije klik
        const back = event.target.closest(".program-reveal__back");
        if (back && event.clientX > back.getBoundingClientRect().left + back.clientWidth) return; // traka za scroll
        const link = card.querySelector(".program-reveal__actions a[href]");
        if (!link) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey) window.open(link.href, "_blank", "noopener");
        else link.click();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setExpanded(false);
          suppressFocus.current = true;
          event.currentTarget.focus({ preventScroll: true });
          suppressFocus.current = false;
        }
      }}>
      <div className="program-reveal__body" ref={bodyRef}>
        {artwork && <div className="program-reveal__artwork" aria-hidden="true">{artwork}</div>}
        <div className="program-reveal__front">
          {beforeTitle && <div className="program-reveal__before" aria-hidden={expanded} inert={expanded ? "" : undefined}>{beforeTitle}</div>}
          <div className={titleAside ? "catalog-card__top program-reveal__title-row" : "program-reveal__title-row"}>
            <span aria-hidden="true" className={titleClassName + " program-reveal__title-reserve"}>{program.title}</span>
            <Title ref={titleRef} className={titleClassName + " program-reveal__title"}>{program.title}</Title>
            {titleAside && <div className="program-reveal__aside" aria-hidden={expanded}>{titleAside}</div>}
          </div>
          <div className="program-reveal__summary" aria-hidden={expanded} inert={expanded ? "" : undefined}>{children}</div>
        </div>
        <div id={panelId} className="program-reveal__back" role="region" aria-label={program.title + ": Sadržaj programa"}
          tabIndex={expanded ? 0 : -1} data-lenis-prevent aria-hidden={!expanded} inert={expanded ? undefined : ""}>
          <ProgramBenefits program={program} />
        </div>
      </div>
      <div className="program-reveal__actions">
        {footer}
        <button type="button" className="program-reveal__toggle" aria-expanded={expanded} aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Zatvori sadržaj" : "Što dobivaš"}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  );
}
