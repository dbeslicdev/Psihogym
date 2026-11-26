import { useState } from "react";
import { podrucjaOpcije } from "../data.js";
import { Curve, SplitText, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

export default function KontaktPage() {
  const [formType, setFormType] = useState("savjetovanje");
  const [applicationDate, setApplicationDate] = useState("");
  const [ocekivanjeDrugoChecked, setOcekivanjeDrugoChecked] = useState(false);

  return (
    <V4Shell className="marketing-page pg-contact" data-editorial-waves>
      <section className="on-hero" data-bg="#fbf5ec" data-stop>
        <span className="v4-label">( kontakt )</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Razmišljaš o individualnom radu ili imaš pitanje?",
            },
          ]}
        />
        <p className="on-hero__intro" data-wave-content>
          Za prijavu ispuni obrazac ispod. Tako ću bolje razumjeti s čime dolaziš i lakše ćemo dogovoriti prvi susret.
        </p>
        <p className="on-hero__intro" data-wave-content>
          Svaku prijavu pažljivo pročitam i odgovorim. Ako procijenim da ti mogu pomoći i imam slobodan termin, predložit ću ti prvi susret.
        </p>
      </section>

      <Curve className="kontakt-sekcija" color="#e5ecdd" data-stop aria-label="Obrazac za kontakt">
        <div className="kontakt-layout">
          <div className="kontakt-layout__right">
            <div className="kontakt-toggles" role="group" aria-label="Razlog javljanja">
              <button
                type="button"
                className={`kontakt-toggle${formType === "savjetovanje" ? " is-active" : ""}`}
                aria-pressed={formType === "savjetovanje"}
                onClick={() => setFormType("savjetovanje")}
              >
                Individualni rad
              </button>
              <button
                type="button"
                className={`kontakt-toggle${formType === "upit" ? " is-active" : ""}`}
                aria-pressed={formType === "upit"}
                onClick={() => setFormType("upit")}
              >
                Opći upit
              </button>
            </div>

            {/* Forma: prijava na savjetovanje */}
            <form
              className="kontakt-form"
              onSubmit={(event) => event.preventDefault()}
              hidden={formType !== "savjetovanje"}
            >
              <label className="kontakt-label">
                Ime i prezime
                <input
                  type="text"
                  name="ime_prezime"
                  className="kontakt-input"
                  required
                  autoComplete="name"
                />
              </label>
              <label className="kontakt-label">
                E-mail
                <input
                  type="email"
                  name="email"
                  className="kontakt-input"
                  required
                  autoComplete="email"
                />
              </label>
              <label className="kontakt-label">
                Datum prijave
                <input type="date" name="datum_prijave" className="kontakt-input kontakt-date" required
                  value={applicationDate} data-empty={!applicationDate}
                  onChange={(event) => setApplicationDate(event.target.value)} />
              </label>
              <label className="kontakt-label">
                Broj mobitela (nije obavezno)
                <input
                  type="tel"
                  name="mobitel"
                  className="kontakt-input"
                  autoComplete="tel"
                />
              </label>
              <label className="kontakt-label">
                Imaš li već iskustva s psihoterapijom ili sličnim oblikom podrške? (nije obavezno)
                <textarea name="iskustvo" className="kontakt-textarea" rows={3} />
                <span className="kontakt-hint">Sve što ovdje napišeš vidim samo ja.</span>
              </label>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">
                  Teme o kojima želiš razgovarati
                </legend>
                {podrucjaOpcije.map((opcija) => (
                  <label key={opcija} className="kontakt-check">
                    <input type="checkbox" name="podrucje_rada" value={opcija} />
                    {opcija}
                  </label>
                ))}
              </fieldset>

              <label className="kontakt-label">
                Opiši glavni izazov zbog kojeg se javljaš.
                <textarea
                  name="glavni_problem"
                  className="kontakt-textarea"
                  rows={4}
                  required
                />
                <span className="kontakt-hint">Sve što ovdje napišeš vidim samo ja.</span>
              </label>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">
                  Što očekuješ od našeg rada?
                </legend>
                <label className="kontakt-check">
                  <input type="checkbox" name="ocekivanje_razgovor" />
                  Prostor za razgovor i podršku
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="ocekivanje_alati" />
                  Konkretne alate i strukturiran rad
                </label>
                <label className="kontakt-check">
                  <input
                    type="checkbox"
                    name="ocekivanje_drugo"
                    checked={ocekivanjeDrugoChecked}
                    onChange={(e) => setOcekivanjeDrugoChecked(e.target.checked)}
                  />
                  Drugo:
                  <input
                    type="text"
                    name="ocekivanje_drugo_text"
                    className="kontakt-input"
                    disabled={!ocekivanjeDrugoChecked}
                    aria-label="Drugo očekivanje"
                  />
                </label>
              </fieldset>

              <label className="kontakt-label">
                Što želiš postići?
                <textarea
                  name="ciljevi_savjetovanja"
                  className="kontakt-textarea"
                  rows={4}
                  required
                />
              </label>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">
                  Koji termini susreta ti odgovaraju?
                </legend>
                <label className="kontakt-check">
                  <input type="checkbox" name="termin_prijepodne" />
                  radnim danom prijepodne
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="termin_poslijepodne" />
                  radnim danom poslijepodne
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="termin_svejedno" />
                  svejedno mi je
                </label>
              </fieldset>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">Odakle znaš za Psihogym? (nije obavezno)</legend>
                <label className="kontakt-check">
                  <input type="checkbox" name="izvor_drustvene" />
                  društvene mreže
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="izvor_internet" />
                  internet
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="izvor_preporuke" />
                  preporuke
                </label>
              </fieldset>

              <label className="kontakt-label">
                Želiš li da još nešto znam prije susreta? (nije obavezno)
                <textarea
                  name="dodatno_prije_susreta"
                  className="kontakt-textarea"
                  rows={3}
                />
              </label>
              <label className="kontakt-label">
                Imaš li neko pitanje ili dilemu? (nije obavezno)
                <textarea
                  name="pitanje_dilema"
                  className="kontakt-textarea"
                  rows={3}
                />
              </label>

              <div className="kontakt-disclaimer">
                <label className="kontakt-check">
                  <input type="checkbox" name="uvjeti_prihvat" required />
                  Prihvaćam uvjete individualnog rada navedene na webu.
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="punoljetnost" required />
                  Potvrđujem da imam navršenih 18 godina.
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="gdpr_suglasnost" required />
                  Dajem suglasnost za prikupljanje i obradu svojih osobnih
                  podataka u svrhu prijave, organizacije i provedbe individualnog rada.
                </label>
                <p className="kontakt-disclaimer-text">
                  Tvoje podatke neću dijeliti s drugima i neću ti slati neželjene poruke.
                </p>
              </div>

              <a className="v4-btn" href="mailto:info@psihogym.hr?subject=Individualni rad">
                Otvori e-poštu <span className="cta-arrow" aria-hidden="true">↗</span>
              </a>
              <p className="kontakt-disclaimer-text kontakt-urgent">
                Ako ti je podrška potrebna odmah, ne čekaj na moj odgovor. Obrati se svom liječniku ili najbližoj zdravstvenoj ustanovi.
              </p>
            </form>

            {/* Forma: opći upit */}
            <form
              className="kontakt-form"
              onSubmit={(event) => event.preventDefault()}
              hidden={formType !== "upit"}
            >
              <label className="kontakt-label">
                Ime i prezime
                <input
                  type="text"
                  name="ime_prezime"
                  className="kontakt-input"
                  required
                  autoComplete="name"
                />
              </label>
              <label className="kontakt-label">
                E-mail adresa
                <input
                  type="email"
                  name="email"
                  className="kontakt-input"
                  required
                  autoComplete="email"
                />
              </label>
              <label className="kontakt-label">
                Upit
                <textarea
                  name="upit"
                  className="kontakt-textarea"
                  rows={5}
                  required
                />
              </label>
              <div className="kontakt-disclaimer">
                <label className="kontakt-check">
                  <input
                    type="checkbox"
                    name="gdpr_suglasnost_opceniti"
                    required
                  />
                  Dajem suglasnost za prikupljanje i obradu svojih osobnih
                  podataka u svrhu odgovora na moj upit.
                </label>
                <p className="kontakt-disclaimer-text">
                  Tvoje podatke neću dijeliti s drugima i neću ti slati neželjene poruke.
                </p>
              </div>
              <a className="v4-btn" href="mailto:info@psihogym.hr?subject=Upit">
                Otvori e-poštu <span className="cta-arrow" aria-hidden="true">↗</span>
              </a>
            </form>
          </div>
        </div>
      </Curve>
    </V4Shell>
  );
}
