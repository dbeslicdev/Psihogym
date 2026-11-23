// Ikona ide uz program (id), a ne uz poziciju, pa promjena redoslijeda ne miješa ikone.
const icons = {
  // Emocionalni razvoj: klica — dva lista iz vijugave stabljike.
  "emocionalni-razvoj": <><path d="M50 92C45 77 56 64 50 46" /><path d="M50 64C38 64 26 55 22 40C36 40 47 50 50 64Z" /><path d="M50 64C40 58 30 50 22 40" /><path d="M51 50C58 36 71 27 86 27C84 43 70 54 51 50Z" /><path d="M51 50C62 43 74 35 86 27" /></>,
  // Anksioznost: spirala — smirivanje iznutra prema van.
  anksioznost: <path d="M50 50a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0" />,
  // Stres: oštro u meko — napeti cik-cak koji se smiri u blagi val.
  stres: <path d="M6 50L12 36L18 64L24 34L30 66L36 40C42 30 48 62 56 54C64 46 70 46 78 50C84 53 88 52 94 50" />,
  // Samopouzdanje: rastući val — val koji jača i penje se.
  samopouzdanje: <path d="M6 78C12 74 16 74 22 78C28 82 32 80 38 72C44 62 50 60 56 66C62 72 66 70 72 56C78 40 86 34 94 20" />,
  // Odnosi: dvije elipse koje se preklapaju.
  odnosi: <><ellipse cx="35" cy="50" rx="25" ry="36" transform="rotate(-18 35 50)" /><ellipse cx="65" cy="50" rx="25" ry="36" transform="rotate(18 65 50)" /></>,
};

export default function ProgramConcept({ id }) {
  return <div className="pc-art" aria-hidden="true">
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      {icons[id]}
    </svg>
  </div>;
}
