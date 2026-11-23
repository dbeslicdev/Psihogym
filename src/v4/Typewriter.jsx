import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TYPE_MS = 90;
const DELETE_MS = 45;
const HOLD_MS = 1800;

/* Typewriter — riječ se briše i upisuje slovo po slovo, u krug (prema heru
   iz psihogym_12-06). Prva riječ je odmah ispisana, pa naslov nikad nije prazan.
   Uz smanjeno kretanje ostaje samo prva riječ, bez kursora koji trepće.
   Čitačima ekrana naslov daje cijelu rečenicu (sr-only), ovo je aria-hidden. */
export default function Typewriter({ words, className = "" }) {
  const [text, setText] = useState(words[0]);
  const [still, setStill] = useState(false);
  const state = useRef({ wordIndex: 0, charIndex: words[0].length, deleting: true });

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    const tick = () => {
      const s = state.current;
      const word = words[s.wordIndex];
      if (!s.deleting) {
        s.charIndex += 1;
        setText(word.slice(0, s.charIndex));
        if (s.charIndex >= word.length) { s.deleting = true; timer = setTimeout(tick, HOLD_MS); return; }
        timer = setTimeout(tick, TYPE_MS);
      } else {
        s.charIndex -= 1;
        setText(word.slice(0, s.charIndex));
        if (s.charIndex <= 0) { s.deleting = false; s.wordIndex = (s.wordIndex + 1) % words.length; }
        timer = setTimeout(tick, DELETE_MS);
      }
    };
    const start = () => {
      clearTimeout(timer);
      if (motion.matches) {
        state.current = { wordIndex: 0, charIndex: words[0].length, deleting: true };
        setText(words[0]);
        setStill(true);
        return;
      }
      setStill(false);
      timer = setTimeout(tick, HOLD_MS);
    };
    start();
    motion.addEventListener("change", start);
    return () => { clearTimeout(timer); motion.removeEventListener("change", start); };
  }, [words]);

  // Nevidljiva najduža riječ drži širinu, pa se tekst oko riječi ne pomiče dok se tipka.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a));
  return (
    <span className={`typewriter ${className}`.trim()} aria-hidden="true">
      <span className="typewriter__sizer">{longest}</span>
      <span className="typewriter__text">{text}{!still && <span className="typewriter__caret" />}</span>
    </span>
  );
}

/* Naslov ostaje u jednom retku kad cijela rečenica s najdužom riječi stane
   u stupac; inače riječ ide u drugi redak. Mjeri se na promjenu širine i
   nakon učitavanja fontova, prije iscrtavanja (bez treptanja). */
export function useSingleLine(ref) {
  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!box) return;
    const check = () => {
      el.dataset.inline = "true";
      const style = getComputedStyle(box);
      const room = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (el.scrollWidth > room + 1) delete el.dataset.inline;
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(box);
    document.fonts?.ready.then(check);
    return () => observer.disconnect();
  }, [ref]);
}
