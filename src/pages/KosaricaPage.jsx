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

/* ============================================================
   Košarica + mock checkout. "Plaćanje" je simulacija —
   nakon kratke obrade upisuje kupnju (entitlement) lokalno i
   otključava program u portalu. U pravoj verziji ovdje ide
   redirect na CorvusPay / Stripe Checkout, a entitlement
   upisuje webhook na backendu.
   ============================================================ */

const METODE = [
  {
    id: "corvus",
    label: "CorvusPay",
    desc: "Kartično plaćanje, moguće rate (testno)",
  },
  {
    id: "stripe",
    label: "Stripe",
    desc: "Kartice, Apple Pay, Google Pay (testno)",
  },
];

export default function KosaricaPage() {
  const items = useCartItems()
    .map((id) => programiById[id])
    .filter(Boolean);
  const [metoda, setMetoda] = useState("corvus");
  const [uvjeti, setUvjeti] = useState(false);
  const [paying, setPaying] = useState(false);
  const [kupljeno, setKupljeno] = useState(null);

  const total = items.reduce((s, p) => s + p.cijenaEur, 0);
  const metodaLabel = METODE.find((m) => m.id === metoda)?.label;

  const handlePay = async () => {
    setPaying(true);
    // Mock: ovdje bi išao redirect na payment gateway
    await new Promise((r) => setTimeout(r, 1200));
    markPurchased(items.map((p) => p.id));
    setKupljeno(items);
    clearCart();
    setPaying(false);
  };

  return (
    <>
      <header className="subhero">
        <p className="subhero__kicker label reveal">// Košarica</p>
        <h1 className="subhero__title reveal" data-delay="1">
          Košarica
        </h1>
      </header>

      <section className="section section--light" aria-label="Košarica">
        {kupljeno ? (
          /* ---------- Uspješna kupnja ---------- */
          <div className="cart-card cart-card--success reveal">
            <p className="label">// Kupnja uspješna</p>
            <h2 className="cart-success__title">Hvala na kupnji! 🎉</h2>
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
              Testna kupnja — ništa nije naplaćeno. Potvrda i račun stižu
              e-mailom tek kad se spoji pravi payment provider.
            </p>
          </div>
        ) : items.length === 0 ? (
          /* ---------- Prazna košarica ---------- */
          <div className="cart-card cart-card--empty reveal">
            <p className="cart-empty__text">Košarica je prazna.</p>
            <Link to="/programi" className="btn btn--dark">
              Pogledaj programe
            </Link>
          </div>
        ) : (
          /* ---------- Stavke + plaćanje ---------- */
          <div className="cart-layout">
            <div className="cart-card reveal">
              <h2 className="cart-card__title">Tvoji programi</h2>
              <ul className="cart-items">
                {items.map((p) => (
                  <li className="cart-item" key={p.id}>
                    <div className="cart-item__info">
                      <span className="cart-item__name">{p.title}</span>
                      <span className="cart-item__meta">
                        {p.trajanje} · {p.razina}
                      </span>
                    </div>
                    <span className="cart-item__price">€{p.cijenaEur}</span>
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
                <span className="cart-total__value">€{total}</span>
              </div>
              <p className="cart-note">Cijene uključuju PDV.</p>
            </div>

            <div className="cart-card reveal" data-delay="1">
              <h2 className="cart-card__title">Plaćanje</h2>
              <div className="cart-methods" role="radiogroup" aria-label="Način plaćanja">
                {METODE.map((m) => (
                  <label
                    key={m.id}
                    className={`cart-method${metoda === m.id ? " is-active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="metoda"
                      value={m.id}
                      checked={metoda === m.id}
                      onChange={() => setMetoda(m.id)}
                    />
                    <span className="cart-method__label">{m.label}</span>
                    <span className="cart-method__desc">{m.desc}</span>
                  </label>
                ))}
              </div>

              <label className="kontakt-check cart-terms">
                <input
                  type="checkbox"
                  checked={uvjeti}
                  onChange={(e) => setUvjeti(e.target.checked)}
                />
                Prihvaćam <a href="#">Uvjete korištenja</a> i suglasan/na sam s
                trenutnim pristupom digitalnom sadržaju.
              </label>

              <button
                type="button"
                className="btn btn--dark cart-pay"
                disabled={!uvjeti || paying}
                onClick={handlePay}
              >
                {paying
                  ? `Preusmjeravanje na ${metodaLabel}…`
                  : `Plati €${total}`}
              </button>
              <p className="cart-note">
                Testno plaćanje — ništa se ne naplaćuje i ne unosiš podatke
                kartice.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
