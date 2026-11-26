import { useEffect } from "react";

export default function useReviewStack(sectionRef) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const steps = [...section.querySelectorAll(".v4-step")];
    const heading = section.querySelector(".v4-iskustva__head");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    let frame;
    let measureFrame;
    const cards = steps.map(step => step.querySelector(".v4-stackcard"));
    // Geometrija koja ne ovisi o scrollu (visine kartica i naslova, kompaktni način,
    // sticky/flow) mjeri se samo pri promjeni veličine, ne u svakom kadru: skidanje
    // i vraćanje data-atributa uz čitanje offsetHeight prisiljavalo je style recalc
    // cijele sekcije (preko tisuću elemenata) pri svakom scroll kadru.
    let heights = [];
    let resolvedTop = 0;
    let fade = 36;
    let stacking = false;
    const measure = () => {
      measureFrame = undefined;
      // Na nižim ekranima najviša kartica ne stane ispod naslova; tada se kartice
      // stisnu (manji razmaci i slova), da naslov i dalje stoji dok se kartice izmjenjuju.
      const fits = () => Math.max(0, ...cards.map(card => card?.offsetHeight || 0)) + (heading?.offsetHeight || 0) + 28 <= innerHeight;
      delete section.dataset.reviewCompact;
      if (!motion.matches && !fits()) {
        section.dataset.reviewCompact = "true";
        if (!fits()) delete section.dataset.reviewCompact;
      }
      heights = cards.map(card => card?.offsetHeight || 0);
      const navClearance = (document.querySelector(".nav")?.offsetHeight || 64) + 8;
      section.style.setProperty("--review-pin-top", navClearance + "px");
      const headingPixels = heading?.offsetHeight || 0;
      resolvedTop = headingPixels + 12;
      // Visina mekog prijelaza: kartica blijedi dok prolazi iza naslova (kao kartice tema).
      fade = Math.round(Math.min(64, Math.max(36, innerHeight * .06)));
      section.style.setProperty("--stack-top", resolvedTop + "px");
      stacking = !motion.matches && Math.max(0, ...heights) + resolvedTop + 16 <= innerHeight;
      section.dataset.reviewLayout = stacking ? "sticky" : "flow";
      const headingHeight = headingPixels + "px";
      if (section.style.getPropertyValue("--review-heading-height") !== headingHeight) {
        section.style.setProperty("--review-heading-height", headingHeight);
      }
      update();
    };
    const update = () => {
      frame = undefined;
      // Read layout before writing any transforms. The sticky wrappers keep
      // their reading pause; only their figures move when the next one touches.
      const tops = steps.map(step => step.getBoundingClientRect().top);
      // Once the last sticky step releases, keep the heading one reading gap
      // above it. Using its actual top also retraces the exit on reverse scroll.
      if (heading && steps.length) {
        heading.style.top = stacking ? Math.min(0, tops.at(-1) - resolvedTop) + "px" : "";
      }
      const positions = [...tops];
      const headingBottom = section.querySelector(".v4-iskustva__head")?.getBoundingClientRect().bottom || 0;
      if (stacking) {
        for (let index = steps.length - 2; index >= 0; index--) {
          const contact = positions[index + 1] - heights[index];
          const progress = Math.min(1, Math.max(0, (tops[index] - contact) / Math.max(1, heights[index])));
          // Finish behind the opaque heading, including the small gap between
          // its lower edge and the next card's sticky reading position.
          const clearance = Math.max(0, tops[index] - headingBottom + 3);
          positions[index] = Math.min(tops[index], contact - progress * clearance);
        }
      }
      steps.forEach((step, index) => {
        const offset = stacking ? positions[index] - tops[index] : 0;
        if (cards[index]) cards[index].style.transform = offset ? `translateY(${offset}px)` : "";
        // Blijeđenje: čim se kartica pomakne iznad svog mjesta, njezin dio uz donji rub
        // naslova postupno postaje proziran (maska), umjesto oštrog reza.
        const rise = stacking ? resolvedTop - positions[index] : 0;
        if (cards[index]) {
          if (rise > 0.5) {
            const cut = headingBottom - positions[index];
            const strength = Math.min(1, rise / fade);
            const mask = `linear-gradient(to bottom, rgba(0,0,0,${(1 - strength).toFixed(3)}) ${cut.toFixed(1)}px, #000 ${(cut + fade).toFixed(1)}px)`;
            cards[index].style.maskImage = mask;
            cards[index].style.webkitMaskImage = mask;
          } else if (cards[index].style.maskImage) {
            cards[index].style.maskImage = "";
            cards[index].style.webkitMaskImage = "";
          }
        }
        const covered = stacking && (positions[index] + heights[index] <= 0 || (index < steps.length - 1 && positions[index + 1] <= tops[index] + 0.5));
        step.dataset.covered = String(covered);
        step.inert = covered;
        if (covered) step.setAttribute("aria-hidden", "true");
        else step.removeAttribute("aria-hidden");
      });
    };
    const schedule = () => {
      if (frame === undefined && measureFrame === undefined) frame = requestAnimationFrame(update);
    };
    const scheduleMeasure = () => {
      if (frame !== undefined) { cancelAnimationFrame(frame); frame = undefined; }
      if (measureFrame === undefined) measureFrame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", schedule, { passive: true, signal: controller.signal });
    window.addEventListener("resize", scheduleMeasure, { passive: true, signal: controller.signal });
    motion.addEventListener("change", scheduleMeasure, { signal: controller.signal });
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(section);
    if (heading) observer.observe(heading);
    steps.forEach(step => observer.observe(step));
    steps.forEach(step => { const card = step.querySelector(".v4-stackcard"); if (card) observer.observe(card); });
    measure();
    return () => {
      controller.abort();
      heading?.style.removeProperty("top");
      section.style.removeProperty("--review-pin-top");
      section.style.removeProperty("--stack-top");
      section.style.removeProperty("--review-heading-height");
      delete section.dataset.reviewLayout;
      delete section.dataset.reviewCompact;
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      steps.forEach(step => { delete step.dataset.covered; step.querySelector(".v4-stackcard")?.style.removeProperty("transform"); step.querySelector(".v4-stackcard")?.style.removeProperty("mask-image"); step.querySelector(".v4-stackcard")?.style.removeProperty("-webkit-mask-image"); step.inert = false; step.removeAttribute("aria-hidden"); });
    };
  }, [sectionRef]);
}