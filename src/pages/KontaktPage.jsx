import { useRef, useState } from "react";
import { podrucjaOpcije } from "../data.js";
import { Curve, SplitText, V4Shell } from "../v4/kit.jsx";
import KontaktDatePicker from "../components/KontaktDatePicker.jsx";
import "../v4.css";

/* Obavezna polja: zvjezdica gore desno iza naziva. Na "Pošalji" se provjeri
   svako obavezno polje / grupa (data-required) i neispunjena se zacrvene uz
   poruku "Obavezno polje". Greška nestaje čim se polje ispuni. */
const Req = () => <span className="kontakt-req" aria-hidden="true">*</span>;
const REQUIRED = "Obavezno polje";
const Err = ({ show, id }) => (show ? <span className="kontakt-error" id={id} role="alert">{show === true ? REQUIRED : show}</span> : null);
// ime@domena.tld — bez razmaka, točno jedan @, domena s točkom i nastavkom od barem 2 slova
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
// Bez razmaka/crtica/zagrada: domaći (0 + 8–9 znamenki) ili međunarodni (+ ili 00, 8–15 znamenki).
const PHONE_RE = /^(0\d{8,9}|(\+|00)\d{8,15})$/;

function findErrors(form) {
  const errors = {};
  for (const el of form.elements) {
    // Mobitel nije obavezan, ali ako je upisan, mora biti ispravan broj.
    if (el.type === "tel" && el.value.trim() && !PHONE_RE.test(el.value.replace(/[\s\-/().]/g, ""))) {
      errors[el.name] = "Upiši ispravan broj mobitela, npr. 091 234 5678 ili +385 91 234 5678";
      continue;
    }
    if (!el.required || el.disabled || !el.name) continue;
    if (el.type === "checkbox") {
      if (!el.checked) errors[el.name] = REQUIRED;
    } else if (!el.value.trim()) {
      errors[el.name] = REQUIRED;
    } else if (el.type === "email" && !EMAIL_RE.test(el.value.trim())) {
      errors[el.name] = "Upiši ispravnu e-mail adresu, npr. ime@domena.hr";
    }
  }
  for (const group of form.querySelectorAll("[data-required]")) {
    const key = group.dataset.required;
    if (group.tagName === "FIELDSET") {
      if (!group.querySelector("input[type=checkbox]:checked")) errors[key] = true;
    } else if (!group.querySelector(`input[name="${key}"]`)?.value) {
      errors[key] = true;
    }
  }
  return errors;
}

// Je li forma netaknuta: nijedno polje upisano, nijedna kućica označena.
function isUntouched(form) {
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === "checkbox" || el.type === "radio") { if (el.checked) return false; }
    else if (el.value && el.value.trim()) return false;
  }
  return true;
}

export default function KontaktPage() {
  const [formType, setFormType] = useState("savjetovanje");
  const [applicationDate, setApplicationDate] = useState("");
  const [ocekivanjeDrugoChecked, setOcekivanjeDrugoChecked] = useState(false);
  const [errors, setErrors] = useState({ savjetovanje: {}, upit: {} });
  const formRefs = { savjetovanje: useRef(null), upit: useRef(null) };

  // Promjena taba: ako je forma koju napuštamo prazna, njezina validacija više nema smisla,
  // pa se briše; djelomično ispunjena forma zadržava greške dok se korisnik ne vrati.
  const switchTo = (next) => {
    if (next === formType) return;
    const leaving = formRefs[formType].current;
    if (leaving && isUntouched(leaving)) setErrors((all) => ({ ...all, [formType]: {} }));
    setFormType(next);
  };

  const submit = (key, mailto) => (event) => {
    event.preventDefault();
    const found = findErrors(event.currentTarget);
    setErrors((all) => ({ ...all, [key]: found }));
    const first = Object.keys(found)[0];
    if (first) {
      const target = event.currentTarget.querySelector(`[name="${first}"], [data-required="${first}"]`);
      const field = target?.closest(".kontakt-label, .kontakt-fieldset, .kontakt-check") ?? target;
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    window.location.href = mailto;
  };
  // Ukloni grešku polja/grupe čim se promijeni.
  const clear = (key) => (event) => {
    const name = event.target.closest("[data-required]")?.dataset.required ?? event.target.name;
    if (!errors[key][name]) return;
    setErrors((all) => {
      const next = { ...all[key] };
      delete next[name];
      return { ...all, [key]: next };
    });
  };
  const e1 = errors.savjetovanje;
  const e2 = errors.upit;
  const inv = (on) => (on ? " is-invalid" : "");

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
          Za prijavu na individualni rad ispuni obrazac ispod. Tako ću bolje razumjeti s čime dolaziš. Svaku prijavu pažljivo pročitam i odgovorim, a ako ti mogu pomoći i imam slobodan termin, predložit ću ti prvi susret. Za ostala pitanja odaberi „Opći upit“.
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
                onClick={() => switchTo("savjetovanje")}
              >
                Individualni rad
              </button>
              <button
                type="button"
                className={`kontakt-toggle${formType === "upit" ? " is-active" : ""}`}
                aria-pressed={formType === "upit"}
                onClick={() => switchTo("upit")}
              >
                Opći upit
              </button>
            </div>

            {/* Forma: prijava na individualni rad */}
            <form
              className="kontakt-form"
              noValidate
              ref={formRefs.savjetovanje}
              onSubmit={submit("savjetovanje", "mailto:info@psihogym.hr?subject=Individualni rad")}
              onChange={clear("savjetovanje")}
              onInput={clear("savjetovanje")}
              hidden={formType !== "savjetovanje"}
            >
              <label className={`kontakt-label${inv(e1.ime_prezime)}`}>
                <span className="kontakt-label__text">Ime i prezime<Req /></span>
                <input type="text" name="ime_prezime" className="kontakt-input" required autoComplete="name" aria-invalid={!!e1.ime_prezime || undefined} />
                <Err show={e1.ime_prezime} />
              </label>
              <label className={`kontakt-label${inv(e1.email)}`}>
                <span className="kontakt-label__text">E-mail<Req /></span>
                <input type="email" name="email" className="kontakt-input" required autoComplete="email" aria-invalid={!!e1.email || undefined} />
                <Err show={e1.email} />
              </label>
              <div className={`kontakt-label${inv(e1.datum_prijave)}`} data-required="datum_prijave">
                <label className="kontakt-label__text" htmlFor="kontakt-datum">Datum prijave<Req /></label>
                <KontaktDatePicker
                  id="kontakt-datum"
                  name="datum_prijave"
                  value={applicationDate}
                  invalid={!!e1.datum_prijave}
                  onChange={(iso) => {
                    setApplicationDate(iso);
                    setErrors((all) => {
                      const next = { ...all.savjetovanje };
                      delete next.datum_prijave;
                      return { ...all, savjetovanje: next };
                    });
                  }}
                />
                <Err show={e1.datum_prijave} />
              </div>
              <label className={`kontakt-label${inv(e1.mobitel)}`}>
                <span className="kontakt-label__text">Broj mobitela</span>
                <input type="tel" name="mobitel" className="kontakt-input" autoComplete="tel" inputMode="tel" aria-invalid={!!e1.mobitel || undefined} />
                <Err show={e1.mobitel} />
              </label>
              <label className="kontakt-label">
                <span className="kontakt-label__text">Imaš li već iskustva s psihoterapijom ili sličnim oblikom podrške?</span>
                <textarea name="iskustvo" className="kontakt-textarea" rows={3} />
                <span className="kontakt-hint">Sve što ovdje napišeš vidim samo ja.</span>
              </label>

              <fieldset className={`kontakt-fieldset${inv(e1.teme)}`} data-required="teme">
                <legend className="kontakt-legend">Teme o kojima želiš razgovarati<Req /></legend>
                {podrucjaOpcije.map((opcija) => (
                  <label key={opcija} className="kontakt-check">
                    <input type="checkbox" name="podrucje_rada" value={opcija} />
                    {opcija}
                  </label>
                ))}
                <Err show={e1.teme} />
              </fieldset>

              <label className={`kontakt-label${inv(e1.glavni_problem)}`}>
                <span className="kontakt-label__text">Opiši glavni izazov zbog kojeg se javljaš.<Req /></span>
                <textarea name="glavni_problem" className="kontakt-textarea" rows={4} required aria-invalid={!!e1.glavni_problem || undefined} />
                <Err show={e1.glavni_problem} />
                <span className="kontakt-hint">Sve što ovdje napišeš vidim samo ja.</span>
              </label>

              <fieldset className={`kontakt-fieldset${inv(e1.ocekivanja)}`} data-required="ocekivanja">
                <legend className="kontakt-legend">Što očekuješ od našeg rada?<Req /></legend>
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
                <Err show={e1.ocekivanja} />
              </fieldset>

              <label className={`kontakt-label${inv(e1.ciljevi_savjetovanja)}`}>
                <span className="kontakt-label__text">Što želiš postići?<Req /></span>
                <textarea name="ciljevi_savjetovanja" className="kontakt-textarea" rows={4} required aria-invalid={!!e1.ciljevi_savjetovanja || undefined} />
                <Err show={e1.ciljevi_savjetovanja} />
              </label>

              <fieldset className={`kontakt-fieldset${inv(e1.termini)}`} data-required="termini">
                <legend className="kontakt-legend">Koji termini susreta ti odgovaraju?<Req /></legend>
                <label className="kontakt-check">
                  <input type="checkbox" name="termin_prijepodne" />
                  Radnim danom prijepodne
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="termin_poslijepodne" />
                  Radnim danom poslijepodne
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="termin_svejedno" />
                  Svejedno mi je
                </label>
                <Err show={e1.termini} />
              </fieldset>

              <fieldset className="kontakt-fieldset">
                <legend className="kontakt-legend">Odakle znaš za Psihogym?</legend>
                <label className="kontakt-check">
                  <input type="checkbox" name="izvor_drustvene" />
                  Društvene mreže
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="izvor_internet" />
                  Internet
                </label>
                <label className="kontakt-check">
                  <input type="checkbox" name="izvor_preporuke" />
                  Preporuke
                </label>
              </fieldset>

              <label className="kontakt-label">
                <span className="kontakt-label__text">Želiš li da još nešto znam prije susreta?</span>
                <textarea name="dodatno_prije_susreta" className="kontakt-textarea" rows={3} />
              </label>
              <label className="kontakt-label">
                <span className="kontakt-label__text">Imaš li neko pitanje ili dilemu?</span>
                <textarea name="pitanje_dilema" className="kontakt-textarea" rows={3} />
              </label>

              <div className="kontakt-disclaimer">
                <div className={`kontakt-check-wrap${inv(e1.uvjeti_prihvat)}`}>
                  <label className="kontakt-check">
                    <input type="checkbox" name="uvjeti_prihvat" required aria-invalid={!!e1.uvjeti_prihvat || undefined} />
                    <span>Prihvaćam uvjete individualnog rada navedene na webu.<Req /></span>
                  </label>
                  <Err show={e1.uvjeti_prihvat} />
                </div>
                <div className={`kontakt-check-wrap${inv(e1.punoljetnost)}`}>
                  <label className="kontakt-check">
                    <input type="checkbox" name="punoljetnost" required aria-invalid={!!e1.punoljetnost || undefined} />
                    <span>Potvrđujem da imam navršenih 18 godina.<Req /></span>
                  </label>
                  <Err show={e1.punoljetnost} />
                </div>
                <div className={`kontakt-check-wrap${inv(e1.gdpr_suglasnost)}`}>
                  <label className="kontakt-check">
                    <input type="checkbox" name="gdpr_suglasnost" required aria-invalid={!!e1.gdpr_suglasnost || undefined} />
                    <span>
                      Dajem suglasnost za prikupljanje i obradu svojih osobnih
                      podataka u svrhu prijave, organizacije i provedbe individualnog rada.<Req />
                    </span>
                  </label>
                  <Err show={e1.gdpr_suglasnost} />
                </div>
                <p className="kontakt-disclaimer-text">
                  Tvoje podatke neću dijeliti s drugima i neću ti slati neželjene poruke.
                </p>
              </div>

              <button type="submit" className="v4-btn">
                Pošalji <span className="cta-arrow" aria-hidden="true">↗</span>
              </button>            </form>

            {/* Forma: opći upit */}
            <form
              className="kontakt-form"
              noValidate
              ref={formRefs.upit}
              onSubmit={submit("upit", "mailto:info@psihogym.hr?subject=Upit")}
              onChange={clear("upit")}
              onInput={clear("upit")}
              hidden={formType !== "upit"}
            >
              <label className={`kontakt-label${inv(e2.ime_prezime)}`}>
                <span className="kontakt-label__text">Ime i prezime<Req /></span>
                <input type="text" name="ime_prezime" className="kontakt-input" required autoComplete="name" aria-invalid={!!e2.ime_prezime || undefined} />
                <Err show={e2.ime_prezime} />
              </label>
              <label className={`kontakt-label${inv(e2.email)}`}>
                <span className="kontakt-label__text">E-mail<Req /></span>
                <input type="email" name="email" className="kontakt-input" required autoComplete="email" aria-invalid={!!e2.email || undefined} />
                <Err show={e2.email} />
              </label>
              <label className={`kontakt-label${inv(e2.upit)}`}>
                <span className="kontakt-label__text">Upit<Req /></span>
                <textarea name="upit" className="kontakt-textarea" rows={5} required aria-invalid={!!e2.upit || undefined} />
                <Err show={e2.upit} />
              </label>
              <div className="kontakt-disclaimer">
                <div className={`kontakt-check-wrap${inv(e2.gdpr_suglasnost_opceniti)}`}>
                  <label className="kontakt-check">
                    <input type="checkbox" name="gdpr_suglasnost_opceniti" required aria-invalid={!!e2.gdpr_suglasnost_opceniti || undefined} />
                    <span>
                      Dajem suglasnost za prikupljanje i obradu svojih osobnih
                      podataka u svrhu odgovora na moj upit.<Req />
                    </span>
                  </label>
                  <Err show={e2.gdpr_suglasnost_opceniti} />
                </div>
                <p className="kontakt-disclaimer-text">
                  Tvoje podatke neću dijeliti s drugima i neću ti slati neželjene poruke.
                </p>
              </div>
              <button type="submit" className="v4-btn">
                Pošalji <span className="cta-arrow" aria-hidden="true">↗</span>
              </button>
            </form>
          </div>
        </div>
      </Curve>
    </V4Shell>
  );
}
