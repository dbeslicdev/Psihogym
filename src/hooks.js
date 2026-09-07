import { useEffect } from "react";

/* Reveal-on-scroll. SVI .reveal elementi fade-inaju pri ulasku u
   viewport I fade-outaju pri izlasku (gore ili dolje) te se ponovno
   animiraju kad se vratiš. Trigger linija je na 88% visine
   (rootMargin -12%) pa se itemi otkrivaju kako ih doscrollavaš.
   Ponovno se veže na svaku promjenu rute (dep). */
export function useScrollReveal(dep) {
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [dep]);
}

/* Parallax na [data-parallax] slikama (skalirane u overflow:hidden frameu). */
export function useParallax(dep) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const imgs = document.querySelectorAll("[data-parallax]");
    if (!imgs.length) return;
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      imgs.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        img.style.transform = `translateY(${(progress * -4).toFixed(2)}%) scale(1.08)`;
      });
      ticking = false;
    };

    const ctrl = new AbortController();
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true, signal: ctrl.signal },
    );
    update();
    return () => ctrl.abort();
  }, [dep]);
}
