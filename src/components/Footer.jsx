import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <a href="mailto:info@psihogym.hr" className="footer__email">
          info@psihogym.hr
        </a>
        <div className="footer__links">
          <Link to="/o-nama">O nama</Link>
          <Link to="/savjetovanje">Savjetovanje</Link>
          <Link to="/programi">Programi</Link>
          <Link to="/kontakt">Kontakt</Link>
        </div>
        <p className="footer__copy">© 2026 Psihogym. Sva prava pridržana.</p>
      </div>
      {/* rotirajući prsten (preseljen iz hero sekcije) */}
      <div className="footer__ring" aria-hidden="true">
        <svg className="footer__ring-svg" viewBox="0 0 300 300">
          <defs>
            <path
              id="footer-ring-path"
              d="M150,150 m-108,0 a108,108 0 1,1 216,0 a108,108 0 1,1 -216,0"
              fill="none"
            />
          </defs>
          <text className="footer__ring-text">
            <textPath href="#footer-ring-path" startOffset="0%">
              psihogym · psihogym · psihogym · psihogym · psihogym ·
            </textPath>
          </text>
        </svg>
      </div>

      <div className="footer__wordmark" aria-hidden="true">psihogym</div>
    </footer>
  );
}
