import { Link } from "react-router-dom";
import ProgramCard from "./ProgramCard.jsx";
import ProgramConcept from "./ProgramConcept.jsx";

export default function ProgramPreviewCard({ program, index, titleHeadingLevel = "h3", id }) {
  return <ProgramCard id={id} className={"v4-program pc-concept pc-watermark pc-palette--" + (index + 1)}
    program={program} titleHeadingLevel={titleHeadingLevel} titleClassName="v4-program__title" delay={index}
    artwork={<ProgramConcept id={program.id} />}
    beforeTitle={<><div className="program-reveal__art-spacer" /><div className="v4-program__meta">
      <span className="v4-program__tag">{program.trajanje}</span>
    </div></>}
    footer={<div className="v4-program__foot">
      <span className="v4-program__price">{program.cijenaEur} €</span>
      <Link to={`/programi/${program.id}`} className="v4-btn v4-btn--ghost">
        <span>Saznaj više</span><span className="cta-arrow" aria-hidden="true">↗</span>
      </Link>
    </div>}>
    <p className="v4-program__tagline">{program.tagline}</p>
  </ProgramCard>;
}
