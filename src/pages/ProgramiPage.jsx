import {register,useAccount} from "../account.js";
import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, isLoggedIn, logout } from "../auth.js";
import { programi } from "../data.js";
import ProgramPreviewCard from "../components/ProgramPreviewCard.jsx";
import { Curve, SplitText, V4Shell } from "../v4/kit.jsx";
import useProgramRail from "../components/useProgramRail.js";
import "../v4.css";

/* ============================================================
   Programi — javni katalog + prijava u portal (LMS).
   Provjera je mockana (vidi auth.js): admin/admin i demo/demo.
   Nakon prijave vodi na traženu stranicu (redirect natrag) ili
   na dashboard /app.
   ============================================================ */

export default function ProgramiPage() {
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  useProgramRail(pinRef, trackRef, progressRef);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/app";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const account=useAccount();
  const loggedIn=!!account.user;
  const [creating,setCreating]=useState(false);
  const [name,setName]=useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if(creating) await register(name,username,password); else await login(username,password);
      navigate(typeof from==='string'&&from.startsWith('/')&&!from.startsWith('//')?from:'/app', {replace:true});
    } catch(error) {setError(error.message);} finally {setLoading(false);}
  };
  const handleLogout = async () => {try {await logout();}catch(error){setError(error.message);}};

  return (
    <V4Shell className="marketing-page pg-playground pg-premium pg-programs" data-editorial-waves>


      <section
        className="v4-programi pg-original-programs pg-program-catalog"
        ref={pinRef}
        data-program-cards="true"
        data-fit-content="true"
        data-bg="#fbf5ec"
        aria-label="Ponuda programa"
      >
        {/* ---------- Katalog ---------- */}
        <div className="v4-programi__sticky">
      <div className="on-hero v4-programi__head">
        <span className="v4-label">ONLINE PROGRAMI</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Odaberi temu koja ti je sada važna i radi na sebi svojim tempom, uz videolekcije i dnevnik s vježbama.",
            },
          ]}
        />
      </div>
        <div className="v4-programi__viewport" data-wave-content tabIndex={0} role="region" aria-label="Pregled online programa">
        <div className="v4-programi__track" ref={trackRef}>
          {programi.map((p, i) => (
            <ProgramPreviewCard id={`program-${p.id}`} program={p} index={i} titleHeadingLevel="h2" key={p.id} />
          ))}
        </div>
        </div>
        <div className="v4-programi__progress" data-wave-content><span ref={progressRef} /></div>
        </div>
      </section>

      {/* ---------- Prijava ---------- */}
      <Curve
        className="prog-sekcija prog-login"
        color="#fbf5ec"
        aria-label="Prijava u portal"
        id="prijava"
      >
        <div className="login-card" data-wave-content>
          {loggedIn ? (
            <>
              <h2 className="login-card__title">Već si prijavljen/na</h2>
              <p className="login-card__hint">
                Nastavi u svom portalu ili se odjavi.
              </p>
              <div className="login-actions">
                <Link to="/app" className="v4-btn">
                  Uđi u portal
                <span className="cta-arrow" aria-hidden="true">↗</span></Link>
                <button
                  type="button"
                  className="login-logout"
                  onClick={handleLogout}
                >
                  Odjavi se
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="login-card__title">{creating?"Izradi račun":"Prijava"}</h2>
              <p className="login-card__hint">Pristupi portalu programa</p>

              <form
                className="kontakt-form login-form"
                onSubmit={handleSubmit}

              >
                {creating && <label className="kontakt-label">Ime<input className="kontakt-input" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" maxLength={100} required /></label>}
                <label className="kontakt-label">
                  E-mail
                  <input
                    type="email"
                    name="username"
                    className="kontakt-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </label>
                <label className="kontakt-label">
                  Lozinka
                  <span className="login-pw">
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      className="kontakt-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={creating?"new-password":"current-password"}
                      minLength={creating?12:undefined}
                      maxLength={128}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="login-pw__toggle"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? "Sakrij lozinku" : "Prikaži lozinku"}
                    >
                      {showPw ? "Sakrij" : "Prikaži"}
                    </button>
                  </span>
                </label>

                {error && (
                  <p className="login-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="login-meta">
                  <Link to="/kontakt" className="login-forgot">
                    Pomoć s pristupom
                  </Link>
                </div>

                <button
                  type="submit"
                  className="v4-btn"
                  disabled={loading}
                >
                  {loading ? "Pričekaj…" : creating?"Izradi račun":"Prijavi se"}
                <span className="cta-arrow" aria-hidden="true">↗</span></button>
              </form>

              <p className="login-note"><button type="button" className="login-logout" onClick={()=>{setCreating(!creating);setError('');}}>{creating?'Već imaš račun? Prijavi se':'Nemaš račun? Registriraj se'}</button></p>
              {creating && <p className="login-note">Lozinka treba imati najmanje 12 znakova. <Link to="/politika-privatnosti">Privatnost</Link></p>}
              {account.error && <p role="alert">{account.error}</p>}

            </>
          )}
        </div>
      </Curve>
    </V4Shell>
  );
}
