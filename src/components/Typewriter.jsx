import { useEffect, useRef, useState } from "react";

const TYPE_MS = 90;
const DELETE_MS = 45;
const HOLD_MS = 1800;

export default function Typewriter({ words }) {
  const [text, setText] = useState(words[0]);
  const state = useRef({
    wordIndex: 0,
    charIndex: words[0].length,
    deleting: false,
  });

  useEffect(() => {
    let timer;
    const tick = () => {
      const s = state.current;
      const word = words[s.wordIndex];
      if (!s.deleting) {
        s.charIndex += 1;
        setText(word.slice(0, s.charIndex));
        if (s.charIndex >= word.length) {
          s.deleting = true;
          timer = setTimeout(tick, HOLD_MS);
          return;
        }
        timer = setTimeout(tick, TYPE_MS);
      } else {
        s.charIndex -= 1;
        setText(word.slice(0, s.charIndex));
        if (s.charIndex <= 0) {
          s.deleting = false;
          s.wordIndex = (s.wordIndex + 1) % words.length;
        }
        timer = setTimeout(tick, DELETE_MS);
      }
    };
    timer = setTimeout(() => {
      state.current.deleting = true;
      tick();
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [words]);

  return (
    <span className="typewriter">
      {text}
      <span className="typewriter__caret" />
    </span>
  );
}
