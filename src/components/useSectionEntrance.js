import { useEffect, useState } from "react";

export default function useSectionEntrance(ref, visualSelector, entranceFraction = .62) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const root = ref.current;
    const visual = root?.querySelector(visualSelector);
    if (!visual) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    let frame;
    // `ahead`: za koliko će se stranica još pomaknuti (cinematic skok najavi odredište,
    // pa ulaz kreće odmah, tijekom skoka, a ne tek po dolasku).
    const check = (ahead = 0) => {
      frame = undefined;
      if (motion.matches || visual.getBoundingClientRect().top - ahead < innerHeight * entranceFraction) {
        root.dataset.ready = "true";
        setReady(true);
        controller.abort();
      }
    };
    window.addEventListener("pg:snap-glide", (event) => check(event.detail.target - scrollY), { signal: controller.signal });
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(check);
      });
    };
    window.addEventListener("scroll", schedule, { passive: true, signal: controller.signal });
    window.addEventListener("resize", schedule, { passive: true, signal: controller.signal });
    motion.addEventListener("change", schedule, { signal: controller.signal });
    const observer = new ResizeObserver(schedule);
    observer.observe(visual);
    check();
    return () => {
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, visualSelector, entranceFraction]);
  return ready;
}