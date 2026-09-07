import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCartItems } from "../cart.js";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const lastY = useRef(0);
  const cartCount = useCartItems().length;

  // Skrivanje na scroll dolje + solid (krem/blur) pozadina izvan heroja
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      const hero = document.querySelector(".hero");
      const navH = navRef.current ? navRef.current.offsetHeight : 0;
      const heroBottom = hero ? hero.offsetHeight - navH : 0;
      setSolid(y > heroBottom);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // Blokiraj scroll dok je menu otvoren
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
  }, [menuOpen]);

  // Zatvori menu na promjenu rute
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navClass = `nav${hidden ? " nav--hidden" : ""}${solid ? " nav--solid" : ""}`;

  return (
    <>
      <nav ref={navRef} className={navClass}>
        <Link to="/" className="nav__logo">
          psihogym<span className="nav__logo-dot">.</span>
        </Link>
        <div className="nav__right">
          <Link
            to="/kosarica"
            className="nav__cart"
            aria-label={`Košarica, ${cartCount} stavki`}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="nav__cart-badge">{cartCount}</span>
            )}
          </Link>
          <button
            className="nav__burger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div className="menu">
        <div className="menu__inner">
          <nav className="menu__nav">
            <Link to="/o-nama" className="menu__link">
              <span className="menu__num">01</span>O nama
            </Link>
            <Link to="/savjetovanje" className="menu__link">
              <span className="menu__num">02</span>Savjetovanje
            </Link>
            <Link to="/programi" className="menu__link">
              <span className="menu__num">03</span>Programi
            </Link>
            <Link to="/kontakt" className="menu__link">
              <span className="menu__num">04</span>Kontakt
            </Link>
          </nav>
          <div className="menu__footer">
            <a href="mailto:info@psihogym.hr" className="menu__email">
              info@psihogym.hr
            </a>
            <div className="menu__social">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
