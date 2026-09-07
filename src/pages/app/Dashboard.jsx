import { useNavigate, Link } from "react-router-dom";
import { programi, brojLekcija } from "../../data.js";
import { getUser, hasAccess, logout } from "../../auth.js";
import { getProgress, progressPct } from "../../progress.js";

/* ============================================================
   Dashboard portala — "Moji programi". Prikazuje samo programe
   kojima prijavljeni korisnik ima pristup (mock uloge).
   ============================================================ */

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  // Aktivni programi kojima korisnik ima pristup
  const moji = programi.filter(
    (p) => p.status === "active" && hasAccess(p.id),
  );

  const handleLogout = () => {
    logout();
    navigate("/programi");
  };

  return (
    <div className="dash">
      <header className="dash__topbar">
        <Link to="/" className="dash__brand">
          psihogym<span className="dash__brand-dot">.</span>
        </Link>
        <div className="dash__user">
          <span className="dash__user-name">{user?.ime}</span>
          <button type="button" className="dash__logout" onClick={handleLogout}>
            Odjava
          </button>
        </div>
      </header>

      <main className="dash__main">
        <p className="label dash__kicker">// Moj portal</p>
        <h1 className="dash__title">
          Bok, {user?.ime?.split(" ")[0]} 👋
        </h1>
        <p className="dash__sub">
          {moji.length > 0
            ? "Nastavi tamo gdje si stao/la."
            : "Trenutno nemaš aktivnih programa."}
        </p>

        {moji.length > 0 ? (
          <div className="program-grid">
            {moji.map((p) => {
              const total = brojLekcija(p);
              const pct = progressPct(p.id, total);
              const { done } = getProgress(p.id);
              const started = done.length > 0;
              return (
                <article className="program-card" key={p.id}>
                  <div className="program-card__head">
                    <h2 className="program-card__title">{p.title}</h2>
                    <span className="program-card__meta">{p.trajanje}</span>
                  </div>
                  <p className="program-card__desc">{p.tagline}</p>

                  <div className="progress">
                    <div className="progress__bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <span className="progress__label">
                      {pct}% · {done.length}/{total} lekcija
                    </span>
                  </div>

                  <Link
                    to={`/app/program/${p.id}`}
                    className="btn btn--dark program-card__cta"
                  >
                    {started ? "Nastavi" : "Započni"}
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dash__empty">
            <p>
              Kad ti dodijelimo program, pojavit će se ovdje. U međuvremenu
              pogledaj{" "}
              <Link to="/programi" className="dash__empty-link">
                ponudu programa
              </Link>
              .
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
