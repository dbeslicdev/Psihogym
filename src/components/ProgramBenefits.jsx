import { pogodnostiPrograma } from "../data.js";

export default function ProgramBenefits({ program }) {
  return (
    <div className="program-benefits">
      <p className="program-benefits__title">Što dobivaš?</p>
      <ul className="program-benefits__list">
        {pogodnostiPrograma(program).map((benefit) => <li key={benefit}>{benefit}</li>)}
      </ul>
    </div>
  );
}
