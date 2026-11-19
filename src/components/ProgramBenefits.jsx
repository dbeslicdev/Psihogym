import { pogodnostiPrograma } from "../data.js";

export default function ProgramBenefits({ program }) {
  return (
    <ul className="program-benefits program-benefits__list">
      {pogodnostiPrograma(program).map((benefit) => <li key={benefit}>{benefit}</li>)}
    </ul>
  );
}
