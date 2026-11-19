import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { programiById } from "../../data.js";
import { useAccount } from "../../account.js";
import { logout } from "../../auth.js";
import "./program-reader.css";

const expiryDate = new Intl.DateTimeFormat("hr-HR", {
  day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Zagreb",
});

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, purchases, expiredPurchases = [], progress } = useAccount();
  const [logoutError, setLogoutError] = useState("");
  const available = purchases.filter(({ programId }) => programiById[programId]?.status === "active");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/programi");
    } catch {
      setLogoutError("Odjava nije uspjela. Pokušaj ponovno.");
    }
  };

  return (
    <div className="dash">
      <header className="dash__topbar">
        <Link to="/" className="dash__brand">psihogym<span className="dash__brand-dot">.</span></Link>
        <div className="dash__user">
          <span className="dash__user-name">{user.ime}</span>
          <button type="button" className="dash__logout" onClick={handleLogout}>Odjava</button>
        </div>
      </header>
      <section className="dash__main" aria-labelledby="my-programs">
        <p className="label dash__kicker">Moj portal</p>
        <h1 className="dash__title" id="my-programs">Moji programi</h1>
        <p className="dash__sub">{available.length ? "Nastavi tamo gdje si stao/la." : "Trenutno nemaš aktivnih programa."}</p>
        {logoutError && <p role="alert">{logoutError}</p>}
        {available.length ? <div className="program-grid">
          {available.map(({ programId, totalLessons, expiresAt }) => {
            const program = programiById[programId];
            const saved = progress[programId];
            const read = saved?.done.length || 0;
            const percent = totalLessons ? Math.round(100 * read / totalLessons) : 0;
            return (
              <article className="program-card" key={programId}>
                <div className="program-card__head">
                  <span className="program-card__meta">{program.trajanje}</span>
                  <h2 className="program-card__title">{program.title}</h2>
                </div>
                <p className="program-card__desc">{program.tagline}</p>
                <div className="progress">
                  <div className="progress__bar" aria-hidden="true"><span style={{ width: percent + "%" }} /></div>
                  <span className="progress__label">Pročitano {read} / {totalLessons} · {percent}%</span>
                </div>
                {expiresAt && <p className="program-card__expiry">Pristup do {expiryDate.format(expiresAt)}</p>}
                <Link to={"/app/program/" + programId} className="btn btn--dark program-card__cta" aria-label={(saved?.current ? "Nastavi" : "Otvori") + " — " + program.title}>
                  {saved?.current ? "Nastavi" : "Otvori program"}
                </Link>
              </article>
            );
          })}
        </div> : <div className="dash__empty"><Link to="/programi" className="btn btn--dark">Pogledaj programe</Link></div>}
        {expiredPurchases.length > 0 && <section className="dash__expired">
          <h2>Istekli programi</h2>
          <ul>{expiredPurchases.map(({ programId, expiresAt }) => (
            <li key={programId}>
              <Link to={"/programi/" + programId}>{programiById[programId].title}</Link>
              <span>Pristup istekao {expiryDate.format(expiresAt)}</span>
            </li>
          ))}</ul>
        </section>}
      </section>
    </div>
  );
}
