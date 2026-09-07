import { useEffect, useRef, useState } from "react";

const DURATION_MS = 2200;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* Broji od 0 do value kad uđe u viewport, i RESETIRA na izlasku pa
   ponovno odbroji svaki put kad se vrati (kao reveal--repeat). Sam
   element nosi .reveal klasu pa ga globalni hook fade-ina uz labelu. */
export default function Counter({ value, suffix, delay }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(`0${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = null;
    const animate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      const start = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        setDisplay(Math.round(easeOut(t) * value) + suffix);
        if (t < 1) rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
        } else {
          if (rafId) cancelAnimationFrame(rafId);
          setDisplay(`0${suffix}`); // reset da ponovno odbroji na povratku
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
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
      {display}
    </span>
  );
}
