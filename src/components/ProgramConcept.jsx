export default function ProgramConcept({ index }) {
  return <div className="pc-art" aria-hidden="true">
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      {index === 0 && <><ellipse cx="42" cy="44" rx="26" ry="33" transform="rotate(-25 42 44)" /><ellipse cx="64" cy="58" rx="24" ry="31" transform="rotate(25 64 58)" /></>}
      {index === 1 && Array.from({ length: 6 }, (_, i) => <path key={i} d={"M" + (15+i*6) + " 90V" + (44+i*6) + "a" + (35-i*6) + " " + (35-i*6) + " 0 0 1 " + (70-i*12) + " 0v" + (46-i*6)} />)}
      {index === 2 && Array.from({ length: 7 }, (_, i) => <path key={i} d={"M5 " + (17+i*11) + "C35 " + (i*11) + " 65 " + (45+i*5) + " 95 " + (18+i*11)} />)}
      {index === 3 && <><ellipse cx="35" cy="50" rx="25" ry="36" transform="rotate(-18 35 50)" /><ellipse cx="65" cy="50" rx="25" ry="36" transform="rotate(18 65 50)" /></>}
      {index === 4 && <><path d="M50 94V6M15 85H85M19 73H81M23 61H77M27 49H73M31 37H69M35 25H65" /><circle cx="50" cy="7" r="4" /></>}
    </svg>
  </div>;
}