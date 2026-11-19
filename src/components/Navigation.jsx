import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCartItems } from "../cart.js";
import SocialLinks from "./SocialLinks.jsx";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);
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
    if (!menuOpen) return;
    const main = document.querySelector("main");
    const wasInert = main?.inert;
    if (main) main.inert = true;
    const navLinks = [...navRef.current.querySelectorAll("a")];
    navLinks.forEach((link) => { link.inert = true; });
    menuRef.current.querySelector("a")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
      }
      if (event.key !== "Tab") return;
      const items = [burgerRef.current, ...menuRef.current.querySelectorAll("a[href], button")];
      const index = items.indexOf(document.activeElement);
      if (index < 0 || (!event.shiftKey && index === items.length - 1) || (event.shiftKey && index === 0)) {
        event.preventDefault();
        items[event.shiftKey ? items.length - 1 : 0].focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      if (main) main.inert = wasInert;
      navLinks.forEach((link) => { link.inert = false; });
      document.removeEventListener("keydown", onKeyDown);
      burgerRef.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  // Zatvori menu na promjenu rute
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  const navClass = `nav${hidden && !menuOpen ? " nav--hidden" : ""}${solid ? " nav--solid" : ""}`;

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
            ref={burgerRef}
            type="button"
            className="nav__burger"
            aria-label={menuOpen ? "Zatvori izbornik" : "Otvori izbornik"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div ref={menuRef} id="site-menu" className="menu" aria-hidden={!menuOpen} inert={menuOpen ? undefined : ""} data-lenis-prevent>
        <div className="menu__inner">
          <nav className="menu__nav" aria-label="Glavni izbornik">
            {[
              ["/o-nama", "O nama"],
              ["/savjetovanje", "Savjetovanje"],
              ["/programi", "Programi"],
              ["/kontakt", "Kontakt"],
            ].map(([path, label], index) => (
              <NavLink key={path} to={path} className="menu__link" onClick={() => setMenuOpen(false)}>
                <span className="menu__num">0{index + 1}</span>{label}
              </NavLink>
            ))}
          </nav>
          <div className="menu__footer">
            <a href="mailto:info@psihogym.hr" className="menu__email">
              info@psihogym.hr
            </a>
            <SocialLinks className="menu__social" />
          </div>
        </div>
      </div>
    </>
  );
}
