import { Link } from "react-router-dom";
import SocialLinks from "./SocialLinks.jsx";
import LogoMark from "./LogoMark.jsx";
import "./footer.css";

const pages = [
  ["/o-nama", "O nama"],
  ["/savjetovanje", "Savjetovanje"],
  ["/programi", "Programi"],
  ["/kontakt", "Kontakt"],
];

export default function Footer({ reloadDocument = false, layout = "contact-strip" }) {
  const masthead = layout !== "signature";
  const strip = layout === "contact-strip";
  // Pravi psihogym logo (SVG) umjesto teksta; veličina prati font-size wordmarka.
  const wordmark = <div className="footer__wordmark" aria-hidden="true"><LogoMark className="footer__logo" /></div>;
  const navigation = (
    <nav className="footer__links" aria-label="Glavne poveznice u podnožju">
      {pages.map(([to, label]) => (
        <Link key={to} to={to} reloadDocument={reloadDocument}><span>{label}</span></Link>
      ))}
    </nav>
  );

  return (
    <footer className={`footer site-footer${masthead ? " site-footer--masthead" : ""}${strip ? " site-footer--strip" : ""}`}>
      {masthead && <div className="footer__masthead">{wordmark}{navigation}</div>}
      <div className="footer__contact">
        <a href="mailto:info@psihogym.hr" className="footer__email">
          <span>info@psihogym.hr</span>
          {strip && <span className="footer__email-arrow" aria-hidden="true">↗</span>}
        </a>
        <SocialLinks className="footer__social" />
      </div>
      {!masthead && navigation}
      <div className="footer__meta">
        <p className="footer__copy">© 2026 Psihogym. Sva prava pridržana.</p>
        <div className="footer__legal">
          <Link to="/politika-privatnosti" reloadDocument={reloadDocument}><span>Politika privatnosti</span></Link>
          <Link to="/politika-kolacica" reloadDocument={reloadDocument}><span>Politika kolačića</span></Link>
        </div>
      </div>
      {!masthead && wordmark}
    </footer>
  );
}
