import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, isLoggedIn, logout } from "../auth.js";
import { programi } from "../data.js";
import { addToCart, isPurchased, useCartItems } from "../cart.js";
import { SplitText, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

/* ============================================================
   Programi — javni katalog + prijava u portal (LMS).
   Provjera je mockana (vidi auth.js): admin/admin i demo/demo.
   Nakon prijave vodi na traženu stranicu (redirect natrag) ili
   na dashboard /app.
   ============================================================ */

export default function ProgramiPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/app";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const cart = useCartItems();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError("Neispravno korisničko ime ili lozinka.");
    }
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  return (
    <V4Shell>
      <section className="on-hero" data-bg="#faf6f0">
        <span className="v4-label">( online programi )</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Vođeni online programi za rad na sebi — svojim tempom, uz materijale i vježbe.",
            },
          ]}
        />
      </section>

      <section
        className="prog-sekcija"
        data-bg="#faf6f0"
        aria-label="Ponuda programa"
      >
        {/* ---------- Katalog ---------- */}
        <div className="catalog">
          {programi.map((p, i) => (
            <article
              className={`catalog-card reveal${p.status === "soon" ? " is-soon" : ""}`}
              data-delay={i % 3 || undefined}
              key={p.id}
            >
              <div className="catalog-card__top">
                <h2 className="catalog-card__title">{p.title}</h2>
                {p.status === "soon" ? (
                  <span className="catalog-card__badge">Uskoro</span>
                ) : (
                  <span className="catalog-card__price">€{p.cijenaEur}</span>
                )}
              </div>
              <p className="catalog-card__tagline">{p.tagline}</p>
              <p className="catalog-card__desc">{p.description}</p>
              <ul className="catalog-card__meta">
                <li>{p.trajanje}</li>
                <li>{p.razina}</li>
              </ul>
              {p.status === "soon" ? (
                <Link to="/kontakt" className="catalog-card__cta">
                  Javi mi kad krene →
                </Link>
              ) : isPurchased(p.id) ? (
                <Link
                  to={`/app/program/${p.id}`}
                  className="catalog-card__cta"
                >
                  Kupljeno — otvori u portalu →
                </Link>
              ) : cart.includes(p.id) ? (
                <Link to="/kosarica" className="catalog-card__cta">
                  U košarici — dovrši kupnju →
                </Link>
              ) : (
                <button
                  type="button"
                  className="catalog-card__cta"
                  onClick={() => addToCart(p.id)}
                >
                  Dodaj u košaricu →
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Prijava ---------- */}
      <section
        className="prog-sekcija prog-login"
        data-bg="#e4e0f4"
        aria-label="Prijava u portal"
        id="prijava"
      >
        <div className="login-card reveal">
          {loggedIn ? (
            <>
              <h2 className="login-card__title">Već si prijavljen/na</h2>
              <p className="login-card__hint">
                Nastavi u svom portalu ili se odjavi.
              </p>
              <div className="login-actions">
                <Link to="/app" className="v4-btn">
                  Uđi u portal
                </Link>
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
              <h2 className="login-card__title">Prijava</h2>
              <p className="login-card__hint">Pristup portalu programa.</p>

              <form
                className="kontakt-form login-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <label className="kontakt-label">
                  Korisničko ime
                  <input
                    type="text"
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
                      autoComplete="current-password"
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
                    Zaboravljena lozinka?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="v4-btn"
                  disabled={loading}
                >
                  {loading ? "Prijava…" : "Prijavi se"}
                </button>
              </form>

              <p className="login-note">
                Demo pristup: <code>admin / admin</code> (svi programi) ili{" "}
                <code>demo / demo</code> (jedan program).
              </p>
            </>
          )}
        </div>
      </section>
    </V4Shell>
  );
}
