import {useAccount} from "../account.js";
import { useState } from "react";
import { Link } from "react-router-dom";
import { programiById } from "../data.js";
import {
  useCartItems,
  removeFromCart,
  clearCart,
  markPurchased,
} from "../cart.js";
import { isLoggedIn } from "../auth.js";

export default function KosaricaPage() {
  const account=useAccount();
  const [paymentError,setPaymentError]=useState("");
  const items = useCartItems()
    .map((id) => programiById[id])
    .filter(Boolean);
  const [uvjeti, setUvjeti] = useState(false);
  const [paying, setPaying] = useState(false);
  const [kupljeno, setKupljeno] = useState(null);

  const total = items.reduce((s, p) => s + p.cijenaEur, 0);

  const handlePay = async () => {
    setPaying(true);
    setPaymentError('');
    try {await markPurchased(items.map(p=>p.id));setKupljeno(items);clearCart();}
    catch(error){setPaymentError(error.message);}finally{setPaying(false);}

  };

  return (
    <div className="checkout-page">
      <header className="subhero">
        <p className="subhero__kicker label">// Košarica</p>
        <h1 className="subhero__title" data-delay="1">
          Košarica
        </h1>
      </header>

      <section className="section section--light" aria-label="Košarica">
        {kupljeno ? (
          /* ---------- Uspješna kupnja ---------- */
          <div className="cart-card cart-card--success">
            <p className="label">// Testna kupnja spremljena</p>
            <h2 className="cart-success__title">Testna kupnja je spremljena.</h2>
            <p className="cart-success__text">
              Otključani su ti sljedeći programi:
            </p>
            <ul className="cart-success__list">
              {kupljeno.map((p) => (
                <li key={p.id}>{p.title}</li>
              ))}
            </ul>
            {isLoggedIn() ? (
              <Link to="/app" className="btn btn--dark">
                Idi u portal
              </Link>
            ) : (
              <>
                <p className="cart-success__text">
                  Prijavi se za pristup svojim programima.
                </p>
                <Link to="/programi#prijava" className="btn btn--dark">
                  Prijavi se
                </Link>
              </>
            )}
            <p className="cart-note">
              Testnom kupnjom programi su dodani na tvoj račun bez naplate.
            </p>
          </div>
        ) : items.length === 0 ? (
          /* ---------- Prazna košarica ---------- */
          <div className="cart-card cart-card--empty">
            <div role="status">
              <h2 className="cart-empty__title">Tvoja košarica je prazna.</h2>
              <p className="cart-empty__text">Odaberi program koji ti odgovara i dodaj ga u košaricu.</p>
            </div>
            <Link to="/programi" className="btn btn--dark">
              <span>Istraži programe</span><span className="cta-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : (
          /* ---------- Stavke + plaćanje ---------- */
          <div className="cart-layout">
            <div className="cart-card">
              <h2 className="cart-card__title">Tvoji programi</h2>
              <ul className="cart-items">
                {items.map((p) => (
                  <li className="cart-item" key={p.id}>
                    <div className="cart-item__info">
                      <span className="cart-item__name">{p.title}</span>
                      <span className="cart-item__meta">
                        {p.trajanje}
                      </span>
                    </div>
                    <span className="cart-item__price">{p.cijenaEur} €</span>
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeFromCart(p.id)}
                      aria-label={`Ukloni ${p.title}`}
                    >
                      Ukloni
                    </button>
                  </li>
                ))}
              </ul>
              <div className="cart-total">
                <span>Ukupno</span>
                <span className="cart-total__value">{total} €</span>
              </div>
              <p className="cart-note">Cijene uključuju PDV.</p>
            </div>

            <div className="cart-card" data-delay="1">
              <h2 className="cart-card__title">Plaćanje</h2>
              {paymentError && <p role="alert">{paymentError}</p>}
              {!account.ready ? (
                <p role="status">Učitavanje računa…</p>
              ) : account.error ? (
                <p role="alert">{account.error}</p>
              ) : !account.testPurchases ? (
                <p className="cart-note">Online kupnja još nije dostupna.</p>
              ) : !account.user ? (
                <>
                  <p className="cart-note">Za testnu kupnju prijavi se ili izradi račun. Program ćeš pronaći u svom portalu.</p>
                  <Link className="btn btn--dark" to="/programi#prijava" state={{ from: "/kosarica" }}>
                    Prijavi se ili izradi račun
                  </Link>
                </>
              ) : (
                <>
                  <label className="kontakt-check cart-terms">
                    <input type="checkbox" checked={uvjeti} onChange={(e) => setUvjeti(e.target.checked)} />
                    <span>Želim dodati odabrane programe na svoj račun testnom kupnjom.</span>
                  </label>
                  <button type="button" className="btn btn--dark cart-pay" disabled={!uvjeti || paying} onClick={handlePay}>
                    {paying ? "Spremanje…" : "Potvrdi testnu kupnju"}
                  </button>
                  <p className="cart-note">Testna kupnja je bez naplate.</p>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
