import { useEffect, useState } from "react";

export default function useRefinedSections(ivanaRef, topicsRef) {
  const [ivanaReady, setIvanaReady] = useState(false);
  useEffect(() => {
    const ivana = ivanaRef.current;
    const topics = topicsRef.current;
    if (!topics) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 80.001rem) and (min-height: 42.001rem)");
    const cards = [...topics.querySelectorAll(".v4-chip")];
    const controller = new AbortController();
    let frame;
    let previousTime;
    const state = cards.map(() => ({ x: 0, opacity: 1, initialized: false }));
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const smooth = (value) => value * value * (3 - 2 * value);
    const update = (time) => {
      frame = undefined;
      const dt = Math.min(64, previousTime ? time - previousTime : 16);
      previousTime = time;
      const vh = innerHeight;
      const image = ivana?.querySelector(".v4-ivana__media");
      // Sva čitanja geometrije prije ijednog zapisa: čitanje nakon zapisa (stil kartice,
      // data-ready) prisiljava style recalc cijele stranice po svakoj kartici u kadru.
      const imageTop = image ? image.getBoundingClientRect().top : Infinity;
      const bounds = topics.getBoundingClientRect();
      const rects = cards.map(card => card.getBoundingClientRect());
      if (ivana && (reduced.matches || imageTop < vh * .62)) {
        if (ivana.dataset.ready !== "true") {
          ivana.dataset.ready = "true";
          setIvanaReady(true);
        }
      }
      let moving = false;
      cards.forEach((card, index) => {
        const rect = rects[index];
        const center = rect.top + rect.height / 2;
        const enter = smooth(clamp((vh * 1.22 - center) / (vh * .45)));
        const exit = smooth(clamp((center - vh * .22) / (vh * .3)));
        const progress = reduced.matches ? 1 : Math.min(enter, exit);
        const side = index % 2 ? 1 : -1;
        const targetX = desktop.matches && !reduced.matches ? side * Math.min(innerWidth * .26, 430) * (1 - progress) : 0;
        const targetOpacity = desktop.matches && !reduced.matches ? progress : 1;
        const current = state[index];
        const ease = 1 - Math.exp(-dt / 85);
        if (!current.initialized || reduced.matches) {
          current.x = targetX;
          current.opacity = targetOpacity;
          current.initialized = true;
        } else {
          current.x += (targetX - current.x) * ease;
          current.opacity += (targetOpacity - current.opacity) * ease;
        }
        card.style.setProperty("--enterX", current.x.toFixed(2) + "px");
        card.style.opacity = current.opacity.toFixed(3);
        if (Math.abs(current.x - targetX) > .1 || Math.abs(current.opacity - targetOpacity) > .002) moving = true;
      });
      const heading = topics.querySelector(".pg-topics-heading");
      const lastCenter = Math.max(...rects.slice(-2).map(rect => rect.top + rect.height / 2));
      const headingOpacity = desktop.matches && !reduced.matches
        ? smooth(clamp((lastCenter - vh * .22) / (vh * .3))) : 1;
      heading.style.opacity = headingOpacity.toFixed(3);
      if (moving && bounds.bottom > -vh && bounds.top < vh * 2) frame = requestAnimationFrame(update);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true, signal: controller.signal });
    window.addEventListener("resize", schedule, { passive: true, signal: controller.signal });
    reduced.addEventListener("change", schedule, { signal: controller.signal });
    desktop.addEventListener("change", schedule, { signal: controller.signal });
    const observer = new ResizeObserver(schedule);
    if (ivana) observer.observe(ivana);
    observer.observe(topics);
    schedule();
    return () => {
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ivanaRef, topicsRef]);
  return ivanaReady;
}