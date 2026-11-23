import {useAccount,refreshAccount} from "./account.js";
import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { smoothScroll } from "./smoothScroll.js";
import Navigation from "./components/Navigation.jsx";
import ScrollThread from "./v4/ScrollThread.jsx";
import Footer from "./components/Footer.jsx";
import V2Page from "./pages/V2Page.jsx";
import V3Page from "./pages/V3Page.jsx";
import V4Page from "./pages/V4Page.jsx";
import ONamaPage from "./pages/ONamaPage.jsx";
import SavjetovanjePage from "./pages/SavjetovanjePage.jsx";
import ProgramiPage from "./pages/ProgramiPage.jsx";
import ProgramDetailPage from "./pages/ProgramDetailPage.jsx";
import KontaktPage from "./pages/KontaktPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import KosaricaPage from "./pages/KosaricaPage.jsx";
import Dashboard from "./pages/app/Dashboard.jsx";
import ProgramPlayer from "./pages/app/ProgramPlayer.jsx";
import { useScrollReveal, useParallax } from "./hooks.js";
import { isLoggedIn } from "./auth.js";
import { programiById } from "./data.js";

// Guard za /app zonu — bez mock prijave vraća na /programi,
// uz pamćenje odredišta (redirect natrag nakon prijave).
function RequireAuth({ children }) {
  const location = useLocation();
  const account = useAccount();
  if (!account.ready) return <p className="legal-page">Učitavanje računa…</p>;
  if (account.error) return <div className="legal-page"><p role="alert">{account.error}</p><button onClick={refreshAccount}>Pokušaj ponovno</button></div>;
  if (!isLoggedIn()) {
    return (
      <Navigate to="/programi#prijava" replace state={{ from: location.pathname }} />
    );
  }
  return children;
}

// Naslov taba po ruti
const TITLES = {
  "/": "psihogym — online psihosocijalna podrška",
  "/o-nama": "O nama — psihogym",
  "/savjetovanje": "Savjetovanje — psihogym",
  "/programi": "Programi — psihogym",
  "/kosarica": "Košarica — psihogym",
  "/politika-kolacica": "Politika kolačića — psihogym",
  "/politika-privatnosti": "Politika privatnosti — psihogym",
  "/kontakt": "Kontakt — psihogym",
  "/app": "Moji programi — psihogym",
};

function titleFor(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/programi/")) {
    const program = programiById[pathname.split("/").pop()];
    return program ? program.title + " — psihogym" : "Program nije pronađen — psihogym";
  }
  if (pathname.startsWith("/app/program/")) {
    const id = pathname.split("/").pop();
    const p = programiById[id];
    return p ? `${p.title} — psihogym` : "Program — psihogym";
  }
  return "psihogym";
}

export default function App() {
  useAccount();
  useEffect(() => { refreshAccount(); const update=()=>refreshAccount(); window.addEventListener("focus",update); return ()=>window.removeEventListener("focus",update); }, []);
  const location = useLocation();
  const lenisRef = useRef(null);
  // App-zona (LMS): bez marketing navigacije i footera
  const isApp = location.pathname.startsWith("/app");
  const isLegal = location.pathname.startsWith("/politika-");
  const isCart = location.pathname === "/kosarica";
  const isProgramCatalog = location.pathname === "/programi";

  // Lenis smooth/inertia scroll — pozicija "klizne" i mekano sjedne
  // nakon svakog wheel ticka (kao na Nori). Isključeno kod reduced-motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    smoothScroll.instance = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
      smoothScroll.instance = null;
    };
  }, []);

  /* Refresh mora vratiti na vrh. Bez ovoga preglednik (scrollRestoration
     "auto") vrati prethodnu poziciju, pa stranica krene par stotina piksela
     niže — a trag uz rub tada nije na prvoj točki nego malo ispod nje. */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Scroll na vrh pri promjeni rute (preko Lenisa ako je aktivan)
  useEffect(() => {
    const id = location.hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (lenisRef.current) lenisRef.current.scrollTo(target || 0, { immediate: true, offset: target ? -112 : 0 });
    else if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    // Hero na naslovnici je sad svijetao, pa nav svugdje ima tamni tekst na vrhu
    document.body.classList.toggle("page-light", true);
  }, [location.pathname]);

  // Naslov taba prati rutu
  useEffect(() => {
    document.title = titleFor(location.pathname);
  }, [location.pathname]);

  // Globalni scroll efekti — ponovno se vežu na svaku rutu
  useScrollReveal(location.pathname);
  useParallax(location.pathname);

  return (
    <>
      {!isApp && <Navigation />}
      <main key={location.pathname} className="route-fade">
        {!isApp && !isLegal && !isCart && !isProgramCatalog && <ScrollThread />}
        <Routes location={location}>
          {/* v4 "Utočište" je sad STANDARDNI dizajn na / */}
          <Route path="/" element={<V4Page />} />
          <Route path="/v2" element={<V2Page />} />
          <Route path="/v3" element={<V3Page />} />
          {/* stari /v4 link i dalje vodi na isti (sad je home) */}
          <Route path="/v4" element={<Navigate to="/" replace />} />
          <Route path="/o-nama" element={<ONamaPage />} />
          <Route path="/savjetovanje" element={<SavjetovanjePage />} />
          <Route path="/programi" element={<ProgramiPage />} />
          <Route path="/programi/:programId" element={<ProgramDetailPage />} />
          <Route path="/politika-privatnosti" element={<LegalPage kind="privatnost" />} />
          <Route path="/politika-kolacica" element={<LegalPage kind="kolacici" />} />
          <Route path="/kontakt" element={<KontaktPage />} />
          <Route path="/kosarica" element={<KosaricaPage />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/app/program/:programId"
            element={
              <RequireAuth>
                <ProgramPlayer />
              </RequireAuth>
            }
          />
          {/* Kompatibilnost sa starim linkom */}
          <Route path="/app/demo" element={<Navigate to="/app" replace />} />
          <Route path="*" element={
            <section className="missing-page">
              <h1>Stranica nije pronađena</h1>
              <p>Provjeri adresu ili nastavi s početne stranice.</p>
              <Link className="btn btn--dark" to="/">Povratak na početnu</Link>
            </section>
          } />
        </Routes>
        {!isApp && <Footer />}
      </main>
    </>
  );
}
