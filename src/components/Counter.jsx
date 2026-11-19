import { useEffect, useRef, useState } from "react";

const DURATION_MS = 2200;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* Broji od 0 do value kad uđe u viewport, i RESETIRA na izlasku pa
   ponovno odbroji svaki put kad se vrati (kao reveal--repeat). Sam
   element nosi .reveal klasu pa ga globalni hook fade-ina uz labelu. */
export default function Counter({ value, suffix, delay }) {
  const ref = useRef(null);
  const fmt = (n) => n.toLocaleString("hr-HR"); // 3200 → 3.200
  const [display, setDisplay] = useState(`0${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = null;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (motion.matches) {
        setDisplay(fmt(value) + suffix);
        return;
      }
      const start = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        setDisplay(fmt(Math.round(easeOut(t) * value)) + suffix);
        if (t < 1) rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
        } else if (!motion.matches) {
          if (rafId) cancelAnimationFrame(rafId);
          setDisplay(`0${suffix}`); // reset da ponovno odbroji na povratku
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    const onMotionChange = () => {
      if (rafId) cancelAnimationFrame(rafId);
      const rect = el.getBoundingClientRect();
      if (motion.matches || (rect.top < window.innerHeight && rect.bottom > 0)) animate();
      else setDisplay(`0${suffix}`);
    };
    motion.addEventListener("change", onMotionChange);
    if (motion.matches) setDisplay(fmt(value) + suffix);
    return () => {
      motion.removeEventListener("change", onMotionChange);
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, suffix]);

  return (
    <span
      ref={ref}
      className="stats__number reveal"
      data-delay={delay || undefined}
    >
      <span aria-hidden="true">{display}</span>
      <span className="v4-sr-only">{fmt(value) + suffix}</span>
    </span>
  );
}
