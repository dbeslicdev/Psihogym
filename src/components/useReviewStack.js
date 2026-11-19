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
    const update = () => {
      frame = undefined;
      const cards = steps.map(step => step.querySelector(".v4-stackcard"));
      const heights = cards.map(card => card?.offsetHeight || 0);
      const navClearance = (document.querySelector(".nav")?.offsetHeight || 64) + 8;
      section.style.setProperty("--review-pin-top", navClearance + "px");
      const headingPixels = heading?.offsetHeight || 0;
      const resolvedTop = headingPixels + 12;
      section.style.setProperty("--stack-top", resolvedTop + "px");
      const stacking = !motion.matches && Math.max(0, ...heights) + resolvedTop + 16 <= innerHeight;
      section.dataset.reviewLayout = stacking ? "sticky" : "flow";
      const headingHeight = (heading?.offsetHeight || 0) + "px";
      if (section.style.getPropertyValue("--review-heading-height") !== headingHeight) {
        section.style.setProperty("--review-heading-height", headingHeight);
      }
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
        const covered = stacking && (positions[index] + heights[index] <= 0 || (index < steps.length - 1 && positions[index + 1] <= tops[index] + 0.5));
        step.dataset.covered = String(covered);
        step.inert = covered;
        if (covered) step.setAttribute("aria-hidden", "true");
        else step.removeAttribute("aria-hidden");
      });
    };
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true, signal: controller.signal });
    window.addEventListener("resize", schedule, { passive: true, signal: controller.signal });
    motion.addEventListener("change", schedule, { signal: controller.signal });
    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    if (heading) observer.observe(heading);
    steps.forEach(step => observer.observe(step));
    steps.forEach(step => { const card = step.querySelector(".v4-stackcard"); if (card) observer.observe(card); });
    update();
    return () => {
      controller.abort();
      heading?.style.removeProperty("top");
      section.style.removeProperty("--review-pin-top");
      section.style.removeProperty("--stack-top");
      section.style.removeProperty("--review-heading-height");
      delete section.dataset.reviewLayout;
      observer.disconnect();
      cancelAnimationFrame(frame);
      steps.forEach(step => { delete step.dataset.covered; step.querySelector(".v4-stackcard")?.style.removeProperty("transform"); step.inert = false; step.removeAttribute("aria-hidden"); });
    };
  }, [sectionRef]);
}