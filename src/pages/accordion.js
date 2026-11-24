import { jumpTo } from "../smoothScroll.js";

// Harmonika za <details data-accordion="grupa">: u grupi je otvorena najviše jedna stavka.
// Otvaranje i zatvaranje kratko se animira, a kliknuti naslov cijelo vrijeme ostaje
// na istom mjestu na ekranu: kad se zatvara stavka iznad, stranica mekano klizi
// umjesto da skoči. Grupe vodimo sami (ne preko atributa name), jer bi preglednik
// staru stavku zatvorio trenutačno, bez animacije.
const DURATION = 280;
const EASING = "cubic-bezier(.22,.7,.2,1)";
const running = new Map(); // details → završi animaciju odmah

const finishAll = () => [...running.values()].forEach(finish => finish());

function toggle(summary) {
  finishAll();
  const details = summary.parentElement;
  const opening = !details.open;
  const closers = opening
    ? [...document.querySelectorAll(`details[data-accordion="${CSS.escape(details.dataset.accordion)}"][open]`)].filter(d => d !== details)
    : [details];
  const before = summary.getBoundingClientRect().top;
  const pin = () => {
    const shift = summary.getBoundingClientRect().top - before;
    if (Math.abs(shift) > .5) jumpTo(window.scrollY + shift);
  };

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    closers.forEach(d => { d.open = false; });
    if (opening) details.open = true;
    pin();
    return;
  }

  // Izmjeri početnu i završnu visinu svake stavke (bez iscrtavanja između), i to
  // već s overflow: hidden kakav vrijedi tijekom animacije: inače margine sadržaja
  // ispadnu iz mjerenja pa se razmak doda tek nakon animacije, u drugom koraku.
  const prepare = d => { d.style.overflow = "hidden"; d.style.boxSizing = "border-box"; };
  const plans = closers.map(d => {
    prepare(d);
    const from = d.getBoundingClientRect().height;
    d.open = false;
    const to = d.getBoundingClientRect().height;
    d.open = true;
    return { d, from, to, closing: true };
  });
  if (opening) {
    prepare(details);
    const from = details.getBoundingClientRect().height;
    details.open = true;
    plans.push({ d: details, from, to: details.getBoundingClientRect().height, closing: false });
  }

  for (const { d, from, to, closing } of plans) {
    d.classList.toggle("is-closing", closing);
    const animation = d.animate({ height: [from + "px", to + "px"] }, { duration: DURATION, easing: EASING, fill: "forwards" });
    const finish = () => {
      if (!running.has(d)) return;
      running.delete(d);
      if (closing) d.open = false;
      animation.cancel();
      d.classList.remove("is-closing");
      d.style.overflow = "";
      d.style.boxSizing = "";
    };
    running.set(d, finish);
    animation.onfinish = () => { finish(); pin(); };
  }

  // Svaki kadar vrati kliknuti naslov na početno mjesto.
  const follow = () => {
    pin();
    if (plans.some(({ d }) => running.has(d))) requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}

export function setupAccordions() {
  const onClick = event => {
    const summary = event.target.closest?.("details[data-accordion] > summary");
    if (!summary || event.defaultPrevented) return;
    event.preventDefault();
    toggle(summary);
  };
  document.addEventListener("click", onClick);
  return () => {
    document.removeEventListener("click", onClick);
    finishAll();
  };
}
