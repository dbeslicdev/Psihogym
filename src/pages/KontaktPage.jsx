import { useState } from "react";
import { podrucjaOpcije } from "../data.js";
import { SplitText, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

export default function KontaktPage() {
  const [formType, setFormType] = useState("savjetovanje");
  const [drugoChecked, setDrugoChecked] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: povezati s backendom / mail servisom
  };

  return (
    <V4Shell>
      <section className="on-hero" data-bg="#faf6f0">
        <span className="v4-label">( kontakt )</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Želiš započeti ili imaš pitanje? Javi se — odgovorim ti u najkraćem mogućem roku.",
            },
          ]}
        />
      </section>

      <section className="kontakt-sekcija" data-bg="#faf6f0" aria-label="Obrazac za kontakt">
        <div className="kontakt-layout">
          <div className="kontakt-layout__left reveal">
            <h2 className="kontakt-intro-title">Ispuni obrazac</h2>
            <p className="kontakt-intro-text">
              Odaberi vrstu poruke i popuni polja u nastavku — javit ću ti se
              čim prije budem mogla.
            </p>
          </div>

          <div className="kontakt-layout__right reveal" data-delay="1">
            <div className="kontakt-toggles" role="tablist">
              <button
                type="button"
                className={`kontakt-toggle${formType === "savjetovanje" ? " is-active" : ""}`}
                aria-pressed={formType === "savjetovanje"}
                onClick={() => setFormType("savjetovanje")}
              >
                Savjetovanje
              </button>
              <button
                type="button"
                className={`kontakt-toggle${formType === "upit" ? " is-active" : ""}`}
                aria-pressed={formType === "upit"}
                onClick={() => setFormType("upit")}
              >
                Upit
              </button>
            </div>

            {/* Forma: prijava na savjetovanje */}
            <form
              className="kontakt-form"
              onSubmit={handleSubmit}
              noValidate
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
                <input type="date" name="datum_prijave" className="kontakt-input" />
              </label>
              <label className="kontakt-label">
                OIB
                <input
                  type="text"
                  name="oib"
                  className="kontakt-input"
                  inputMode="numeric"
                  pattern="[0-9]{11}"
                  maxLength={11}
                  title="Unesite 11 znamenki"
                />
              </label>
              <label className="kontakt-label">
                Adresa stanovanja
                <input
                  type="text"
                  name="adresa"
                  className="kontakt-input"
                  autoComplete="street-address"
                />
              </label>
              <label className="kontakt-label">
                Broj mobitela
                <input
                  type="tel"
                  name="mobitel"
                  className="kontakt-input"
                  autoComplete="tel"
                />
              </label>
              <label className="kontakt-label">
                Jesi li prethodno već imao/la iskustvo savjetovanja ili
                psihoterapije?
                <textarea name="iskustvo" className="kontakt-textarea" rows={3} />
              </label>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">
                  Područja na kojima želiš raditi
                </legend>
                {podrucjaOpcije.map((opcija) => (
                  <label key={opcija} className="kontakt-check">
                    <input type="checkbox" name="podrucje_rada" value={opcija} />
                    {opcija}
                  </label>
                ))}
              </fieldset>

              <label className="kontakt-label">
                Koji je glavni problem s kojim se trenutno suočavaš?
                <textarea
                  name="glavni_problem"
                  className="kontakt-textarea"
                  rows={4}
                />
              </label>
              <label className="kontakt-label">
                Navedi željene ciljeve savjetovanja.
                <textarea
                  name="ciljevi_savjetovanja"
                  className="kontakt-textarea"
                  rows={4}
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
                  <input type="checkbox" name="termin_fleksibilan" />
                  fleksibilan/na sam
                </label>
                <label className="kontakt-check">
                  <input
                    type="checkbox"
                    name="termin_drugo"
                    checked={drugoChecked}
                    onChange={(e) => setDrugoChecked(e.target.checked)}
                  />
                  Drugo:
                  <input
                    type="text"
                    name="termin_drugo_text"
                    className="kontakt-input"
                    disabled={!drugoChecked}
                    aria-label="Drugi termin"
                  />
                </label>
              </fieldset>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">Kako si saznao/la za nas?</legend>
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
                Želiš li da još nešto znamo prije susreta?
                <textarea
                  name="dodatno_prije_susreta"
                  className="kontakt-textarea"
                  rows={3}
                />
              </label>
              <label className="kontakt-label">
                Imaš li neko pitanje ili dilemu?
                <textarea
                  name="pitanje_dilema"
                  className="kontakt-textarea"
                  rows={3}
                />
              </label>

              <div className="kontakt-disclaimer">
                <label className="kontakt-check">
                  <input type="checkbox" name="uvjeti_prihvat" required />
                  Potvrđujem da sam upoznat/a s uvjetima savjetovanja navedenim
                  na web-u i da ih prihvaćam.
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="gdpr_suglasnost" required />
                  Dajem suglasnost za prikupljanje i obradu svojih osobnih
                  podataka u svrhu prijave, organizacije i provedbe savjetovanja.
                </label>
                <p className="kontakt-disclaimer-text">
                  Ne brini, nećemo dijeliti tvoje podatke i nećemo ti slati
                  neželjene mailove. Za više informacija pročitaj našu{" "}
                  <a href="#">Politiku privatnosti</a>.
                </p>
              </div>

              <button type="submit" className="v4-btn">
                Pošalji prijavu
              </button>
            </form>

            {/* Forma: opći upit */}
            <form
              className="kontakt-form"
              onSubmit={handleSubmit}
              noValidate
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
                  podataka u svrhu prijave, organizacije i provedbe savjetovanja.
                </label>
                <p className="kontakt-disclaimer-text">
                  Ne brini, nećemo dijeliti tvoje podatke i nećemo ti slati
                  neželjene mailove. Za više informacija pročitaj našu{" "}
                  <a href="#">Politiku privatnosti</a>.
                </p>
              </div>
              <button type="submit" className="v4-btn">
                Pošalji upit
              </button>
            </form>
          </div>
        </div>
      </section>
    </V4Shell>
  );
}
