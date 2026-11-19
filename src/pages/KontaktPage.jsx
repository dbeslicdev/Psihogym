import { useState } from "react";
import { podrucjaOpcije } from "../data.js";
import { Curve, SplitText, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

export default function KontaktPage() {
  const [formType, setFormType] = useState("savjetovanje");
  const [applicationDate, setApplicationDate] = useState("");
  const [drugoChecked, setDrugoChecked] = useState(false);
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
              text: "Razmišljaš o savjetovanju ili imaš pitanje?",
            },
          ]}
        />
        <p className="on-hero__intro" data-wave-content>
          Za prijavu ili upit piši na <a href="mailto:info@psihogym.hr">info@psihogym.hr</a>.
        </p>
      </section>

      <Curve className="kontakt-sekcija" color="#e5ecdd" data-stop aria-label="Obrazac za kontakt">
        <div className="kontakt-layout">
          <div className="kontakt-layout__right">
            <p className="kontakt-availability">Obrasci su trenutačno dostupni za pregled. Za prijavu ili upit <a href="mailto:info@psihogym.hr">javi se e-poštom</a>.</p>
            <div className="kontakt-toggles" role="group" aria-label="Razlog javljanja">
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
                <input type="date" name="datum_prijave" className="kontakt-input kontakt-date"
                  value={applicationDate} data-empty={!applicationDate}
                  onChange={(event) => setApplicationDate(event.target.value)} />
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
                  teme o kojima želiš pričati
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
                />
              </label>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">
                  Što očekuješ od savjetovanja?
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
                  neželjene mailove.
                </p>
              </div>

              <a className="v4-btn" href="mailto:info@psihogym.hr?subject=Savjetovanje">
                Otvori e-poštu <span className="cta-arrow" aria-hidden="true">↗</span>
              </a>
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
                  podataka u svrhu prijave, organizacije i provedbe savjetovanja.
                </label>
                <p className="kontakt-disclaimer-text">
                  Ne brini, nećemo dijeliti tvoje podatke i nećemo ti slati
                  neželjene mailove.
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
