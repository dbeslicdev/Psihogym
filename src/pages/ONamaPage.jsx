import { Link } from "react-router-dom";
import { SplitText, Curve, V4Shell } from "../v4/kit.jsx";
import "../v4.css";

/* O NAMA — v4 "Utočište" jezik: uvodna rečenica slovo-po-slovo, arch
   portret, dvostupčani prose, prvi val na "profesionalni put", CTA.
   Boje/tipografija iz globalnih tokena (--ps-*). */
export default function ONamaPage() {
  return (
    <V4Shell>
      {/* ===== 1. SUBHERO — velika uvodna rečenica, slovo po slovo ===== */}
      <section className="on-hero" data-bg="#faf6f0">
        <span className="v4-label">( o nama )</span>
        <SplitText
          as="h1"
          className="on-hero__title"
          delay={0.1}
          segments={[
            {
              text: "Spajamo iskustvo sa stručnim znanjem i provjerenim terapijskim pristupima — da te podržimo tu gdje jesi i pomognemo ti stići kamo želiš.",
            },
          ]}
        />
      </section>

      {/* ===== 2. PORTRET — arch slika + ime + uloga ===== */}
      <section className="v4-ivana on-portret" data-bg="#faf6f0">
        <div className="v4-ivana__arch reveal">
          <img src="/ivana_mitric2.jpg" alt="Ivana Bešlić" />
        </div>
        <h2 className="v4-ivana__name reveal">Ivana Bešlić</h2>
        <p className="on-portret__role reveal" data-delay="1">
          magistra socijalne pedagogije · savjetovateljica u psihoterapiji
        </p>
      </section>

      {/* ===== 3. NEKOLIKO RIJEČI O MENI — bio, dvostupčano (krem) ===== */}
      <section className="on-prose" data-bg="#faf6f0">
        <h2 className="on-prose__title reveal">
          Nekoliko riječi <em>o meni</em>
        </h2>
        <div className="on-prose__body reveal" data-delay="1">
          <p>
            Ja sam Ivana Bešlić, magistra socijalne pedagogije i
            savjetovateljica u psihoterapiji. Prije svega sam supruga, majka,
            sestra, prijateljica, trčalica, pjevalica, putnica i cjeloživotna
            učenica.
          </p>
          <p>
            Vjerujem da svi možemo mijenjati ono što nam ne odgovara — u sebi,
            u odnosima i u svakodnevnici. Zato ti kroz svoj rad pomažem
            prepoznati, razumjeti i zamijeniti obrasce ponašanja i razmišljanja
            koji ti više ne služe — s onima koji ti služe.
          </p>
        </div>
      </section>

      {/* ===== 4. MOJ PROFESIONALNI PUT — prvi VAL (sage-soft) ===== */}
      <Curve color="#dde5d8" className="on-prose on-prose--curve">
        <h2 className="on-prose__title reveal">
          Moj profesionalni <em>put</em>
        </h2>
        <div className="on-prose__body reveal" data-delay="1">
          <p>
            Nakon gimnazije u Đakovu, upisujem Socijalnu pedagogiju na
            Edukacijsko-rehabilitacijskom fakultetu u Zagrebu, gdje se ubrzo
            upoznajem s transakcijskom analizom — psihoterapijskim pravcem koji
            mi daje konkretne alate za razumijevanje sebe i odnosa s drugima.
          </p>
          <p>
            S vremenom, TA postaje moj osobni i profesionalni kompas — nešto
            što me i danas vodi u radu s ljudima, ali i u svakodnevnom životu.
            Uz studij i kasnije kroz posao, završavam brojne dodatne edukacije,
            sudjelujem u nacionalnim i međunarodnim projektima te se
            kontinuirano stručno usavršavam — prvo u osnovnoškolskom, a potom u
            visokom obrazovanju i odgojnom savjetovalištu u Zagrebu.
          </p>
          <p>
            Nakon potresa u Zagrebu i pandemije, vraćam se u rodnu Slavoniju i
            pokrećem vlastitu savjetodavnu praksu.
          </p>
        </div>
      </Curve>

      {/* ===== 5. CTA — lavanda finale ===== */}
      <Curve color="#c9c3e6" className="v4-cta">
        <h2 className="v4-cta__title">
          Želiš saznati <em>više?</em>
        </h2>
        <p className="v4-cta__sub">
          Otvorena sam za razgovor — javi se i krenimo tvojim tempom.
        </p>
        <div className="on-cta__row">
          <Link to="/savjetovanje" className="v4-btn">
            Savjetovanje
          </Link>
          <Link to="/kontakt" className="v4-btn v4-btn--ghost">
            Kontakt
          </Link>
        </div>
      </Curve>
    </V4Shell>
  );
}
