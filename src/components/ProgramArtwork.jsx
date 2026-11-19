import { useId } from "react";

const IDENTITIES = {
  "emocionalni-razvoj": { number: "01", title: "Emocionalni razvoj", note: "Osjeti. Razumij. Izrazi.", paper: "var(--ps-terra)", ink: "var(--ps-brown)", motif: "layers" },
  anksioznost: { number: "02", title: "Anksioznost", note: "Prostor između misli.", paper: "var(--ps-mist)", ink: "var(--ps-brown)", motif: "rings" },
  stres: { number: "03", title: "Upravljanje stresom", note: "Vrijeme da usporiš.", paper: "var(--ps-cream)", ink: "var(--ps-brown)", motif: "waves" },
  odnosi: { number: "04", title: "Zdraviji odnosi", note: "Bliskost. Granice. Ravnoteža.", paper: "var(--ps-sage-bg)", ink: "var(--ps-brown)", motif: "connection" },
  samopouzdanje: { number: "05", title: "Samopouzdanje", note: "Na svojoj strani.", paper: "var(--ps-brown)", ink: "var(--ps-cream)", motif: "growth" },
};
export const programIdentity = (program) => IDENTITIES[program.id] || IDENTITIES["emocionalni-razvoj"];

export function BrandEmblem({ className = "" }) {
  return <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="50" cy="30" rx="8" ry="20" stroke="currentColor" strokeWidth="1.2" transform={"rotate(" + i * 45 + " 50 50)"} />)}
    <circle cx="50" cy="50" r="4" fill="currentColor" />
  </svg>;
}

function Motif({ kind }) {
  const uid = useId().replace(/:/g, "");
  return <svg className="pa-motif" viewBox="0 0 240 240" fill="none" aria-hidden="true">
    <defs><linearGradient id={uid} x1="35" y1="30" x2="210" y2="215" gradientUnits="userSpaceOnUse"><stop stopColor="currentColor" stopOpacity=".16" /><stop offset="1" stopColor="currentColor" stopOpacity=".65" /></linearGradient></defs>
    {kind === "layers" && <g>
      <ellipse cx="91" cy="107" rx="65" ry="79" transform="rotate(-25 91 107)" fill="currentColor" opacity=".13" />
      <ellipse cx="150" cy="136" rx="62" ry="76" transform="rotate(25 150 136)" fill={"url(#" + uid + ")"} />
      <ellipse cx="120" cy="120" rx="49" ry="87" stroke="currentColor" strokeWidth="1.3" transform="rotate(-20 120 120)" />
      <circle cx="120" cy="120" r="5" fill="currentColor" />
    </g>}
    {kind === "rings" && <g>
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={"M " + (43 + i * 9) + " 204V" + (83 + i * 9) + "a" + (77 - i * 9) + " " + (77 - i * 9) + " 0 0 1 " + (154 - i * 18) + " 0v" + (121 - i * 9)} stroke="currentColor" strokeWidth="1.15" opacity={.25 + i * .1} />)}
      <circle cx="120" cy="151" r="7" fill="currentColor" />
    </g>}
    {kind === "waves" && <g>
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={"M22 " + (45 + i * 18) + "C74 " + (5 + i * 18) + " 154 " + (98 + i * 8) + " 219 " + (48 + i * 17)} stroke="currentColor" strokeWidth="1.3" opacity={.3 + i * .07} />)}
      <circle cx="185" cy="78" r="28" fill="currentColor" opacity=".12" />
    </g>}
    {kind === "connection" && <g>
      <ellipse cx="87" cy="121" rx="59" ry="88" transform="rotate(-18 87 121)" fill="currentColor" opacity=".1" />
      <ellipse cx="153" cy="121" rx="59" ry="88" transform="rotate(18 153 121)" fill="currentColor" opacity=".19" />
      <ellipse cx="87" cy="121" rx="59" ry="88" transform="rotate(-18 87 121)" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="153" cy="121" rx="59" ry="88" transform="rotate(18 153 121)" stroke="currentColor" strokeWidth="1.4" />
    </g>}
    {kind === "growth" && <g>
      <path d="M61 207V105a59 59 0 0 1 118 0v102" fill="currentColor" opacity=".12" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={"M" + (61 - i * 5) + " " + (202 - i * 18) + "H" + (179 + i * 5)} stroke="currentColor" strokeWidth="1.15" opacity={.35 + i * .08} />)}
      <path d="M120 212V38" stroke="currentColor" strokeWidth="1.4" /><circle cx="120" cy="38" r="6" fill="currentColor" />
    </g>}
  </svg>;
}

export default function ProgramArtwork({ program, large = false }) {
  const identity = programIdentity(program);
  return <div className={"pa-cover" + (large ? " pa-cover--large" : "")} style={{ "--program-paper": identity.paper, "--program-ink": identity.ink }} aria-hidden="true" data-motif={identity.motif}>
    <div className="pa-cover-top"><span>psihogym.</span><span>{identity.number} / 05</span></div>
    <Motif kind={identity.motif} />
    <div className="pa-cover-copy"><span className="pa-cover-label">Online program</span><p>{identity.title}</p><span className="pa-cover-note">{identity.note}</span></div>
    {large && <div className="pa-cover-bottom"><span>{program.trajanje}</span><span>Učenje · Refleksija · Vježbe</span></div>}
  </div>;
}
