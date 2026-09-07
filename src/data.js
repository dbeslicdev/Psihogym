/** Sav sadržaj stranice na jednom mjestu — preslikan iz originala. */

export const podrucja = [
  {
    num: "01",
    title: ["Veze i odnosi"],
    desc: "Pomažemo ti prevladati sukobe i graditi kvalitetnije odnose.",
  },
  {
    num: "02",
    title: ["Anksioznost"],
    desc: "Pomažemo ti razumjeti anksioznost i razviti vještine upravljanja njome.",
  },
  {
    num: "03",
    title: ["Samopouzdanje"],
    desc: "Pomažemo ti graditi unutarnju snagu i vjeru u svoje sposobnosti.",
  },
  {
    num: "04",
    title: ["Zauzimanje", "za sebe"],
    desc: "Pomažemo ti jasno izražavati svoje potrebe i postavljati granice.",
  },
  {
    num: "05",
    title: ["Stres"],
    desc: "Pomažemo ti razviti učinkovitije načine nošenja sa svakodnevnim pritiscima.",
  },
  {
    num: "06",
    title: ["Odgoj i", "roditeljstvo"],
    desc: "Pomažemo ti usvojiti vještine za smirenije i učinkovitije roditeljstvo.",
  },
];

export const stats = [
  { value: 5, suffix: "+", label: "Godina postojanja" },
  { value: 500, suffix: "+", label: "Klijenata" },
  { value: 5000, suffix: "+", label: "Sati savjetovanja" },
  { value: 5, suffix: "", label: "Programa u pripremi" },
];

export const iskustva = [
  {
    name: "Irena J.",
    text: "Odlasci na individualno savjetovanje u Psihogym, promjenilo je kvalitetu mog života i života moje obitelji nabolje. Ivana je profesionalna, empatična i u potpunosti predana klijentu. Predivno iskustvo koje ostavlja duboki trag...Hvala na svemu draga Ivana. Zauvijek ćete ostati dio našeg života",
  },
  {
    name: "Barbara H.",
    text: "Ivana je jako topla i draga, te vrlo pristupačna i susretljiva. Tople preporuke za ovu divnu ženu",
  },
  {
    name: "Andrea D.",
    text: "Toplo preporučujem Psihogym i psihoterapeutkinju Ivanu svima koji osjećaju da im treba podrška u životu. Ivana je strpljiva, ljubazna i profesionalna te mi je pružila potporu u mom nastojanju da budem bolja verzija sebe. Postavili smo itekako dobre temelje za suočavanje sa svime što život nosi. Velika preporuka! :)",
  },
  {
    name: "Gabrijela Stella S.",
    text: "Psihogym je za mene definitivno bio centar unutarnje snage koji mi je dao alate za nošenje sa životnim problemima koje ću koristit cijeli život. Toplo preporučujem psihoterapeuticu Ivanu svakom tko se osjeća izgubljeno i potrebna mu je podrška i pomoć da izgradi sebe iznova u najboljem svjetlu kojem može!",
  },
  {
    name: "Željka A.",
    text: "Upoznali smo Ivanu i njenu terapiju prije 2 godine. Pomogla je mojoj kćeri u najtežim trenucima. S se osjećala ugodno, imala je potpuno povjerenje i što je najvažnije nakon razgovora osjećala se puno bolje. Mi kao roditelji bili smo također jako zadovoljni. Svaka preporuka od nas.",
  },
  {
    name: "Željka A.",
    text: "Upoznali smo Ivanu i njenu terapiju prije 2 godine. Pomogla je mojoj kćeri u najtežim trenucima. S se osjećala ugodno, imala je potpuno povjerenje i što je najvažnije nakon razgovora osjećala se puno bolje. Mi kao roditelji bili smo također jako zadovoljni. Svaka preporuka od nas.",
  },
];

export const mitovi = [
  {
    mit: "Savjetovanje je samo razgovor, a savjetovatelj ti govori što da radiš",
    istina:
      "Nema gotovih rješenja. Savjetovatelj ti pomaže da dođeš do odgovora. Nisi pasivan slušatelj, već aktivni sudionik.",
  },
  {
    mit: "Savjetovanje dugo traje",
    istina:
      "Nekad je dovoljno par susreta, nekad treba više. Sve ovisi o tebi i tvojoj situaciji. Nema univerzalnog trajanja.",
  },
  {
    mit: "Savjetovanje je lagano i ugodno",
    istina:
      "Nekad je teško i neugodno – ali to je ok. Radiš na stvarima koje te stvarno dotiču.",
  },
  {
    mit: "Ako se poteškoće vrate, savjetovanje nije uspjelo",
    istina:
      "Povratak teškoća ne znači da si opet na početku. To je dio procesa.",
  },
  {
    mit: "Napredak je linearan",
    istina:
      "Napredak nije ravna crta. Ima uspona i padova – i to ne znači da ne ideš naprijed.",
  },
  {
    mit: "Postoji jedan ispravan put",
    istina:
      "Nema univerzalne formule. Ono što funkcionira za druge, možda za tebe neće. Za svakoga je to putovanje drugačije.",
  },
  {
    mit: "Savjetovanje je isto kao i razgovor s prijateljem",
    istina:
      "Prijatelj te može saslušati, ali savjetovatelj koristi stručno znanje i metode.",
  },
  {
    mit: "Savjetovanje je za ljude koji se ne mogu nositi s problemima",
    istina:
      "Ljudi obično traže pomoć zato što se žele suočiti s problemima, a ne zato što su nemoćni.",
  },
  {
    mit: "Savjetovatelj je odgovoran za napredak",
    istina:
      "Savjetovatelj te vodi, ali ti moraš hodati. Tvoja spremnost i trud su ključni.",
  },
  {
    mit: "Savjetovanje je preskupo",
    istina: "Mentalno zdravlje nije trošak, već vrijedna investicija.",
  },
];

export const podrucjaOpcije = [
  "Veze i odnosi",
  "Anksioznost",
  "Samopouzdanje",
  "Zauzimanje za sebe",
  "Stres",
  "Odgoj i roditeljstvo",
];

/* ============================================================
   PROGRAMI (LMS) — sadržaj portala. Svaki program je
   samostalan: katalog-meta (opis, cijena, status) + kurikulum
   (moduli/lekcije) + materijali + pitanja za refleksiju.
   Kasnije se preslikava iz Supabasea.
   ============================================================ */

const zajednickiMaterijali = [
  { id: "a1", kind: "PDF", title: "Radni list — dnevnik okidača" },
  { id: "a2", kind: "AUDIO", title: "Vođena audio vježba (12 min)" },
  { id: "a3", kind: "PDF", title: "Sažetak lekcije" },
];

const zajednickaRefleksija = [
  "U kojim se situacijama ovaj tjedan tvoje tijelo prvo javilo — i kako?",
  "Koji se okidač ponavlja najčešće? Što mu obično prethodi?",
  "Što bi ovoga puta mogao/la napraviti drugačije, makar malo?",
];

export const programi = [
  {
    id: "centar-snage",
    title: "Centar unutarnje snage",
    tagline: "Prepoznaj okidače i vrati si prostor za drugačiju reakciju.",
    description:
      "Šestotjedni program koji te vodi od razumijevanja vlastitih obrazaca do konkretnih alata za svakodnevni život.",
    cijenaEur: 149,
    trajanje: "6 tjedana",
    razina: "Za sve razine",
    status: "active",
    modules: [
      {
        id: "m1",
        title: "Dobrodošlica",
        lessons: [
          { id: "l1", title: "Kako koristiti program", duration: "4:12" },
          { id: "l2", title: "Kako nastaje promjena", duration: "7:45" },
        ],
      },
      {
        id: "m2",
        title: "Razumijevanje sebe",
        lessons: [
          { id: "l3", title: "Mapa unutarnjih stanja", duration: "12:30" },
          { id: "l4", title: "Prepoznavanje okidača", duration: "10:18" },
          { id: "l5", title: "Vježba: dnevnik okidača", duration: "6:05" },
        ],
      },
      {
        id: "m3",
        title: "Alati i tehnike",
        lessons: [
          { id: "l6", title: "Tehnika disanja 4-7-8", duration: "8:40" },
          { id: "l7", title: "Postavljanje granica u praksi", duration: "14:22" },
          { id: "l8", title: "Rad s unutarnjim kritičarem", duration: "11:47" },
        ],
      },
      {
        id: "m4",
        title: "Integracija",
        lessons: [
          { id: "l9", title: "Tjedni plan prakse", duration: "9:15" },
          { id: "l10", title: "Kako dalje nakon programa", duration: "5:30" },
        ],
      },
    ],
    assets: zajednickiMaterijali,
    reflection: zajednickaRefleksija,
  },
  {
    id: "granice",
    title: "Granice bez krivnje",
    tagline: "Nauči reći ne bez osjećaja da si nekoga iznevjerio/la.",
    description:
      "Praktičan program o postavljanju i održavanju zdravih granica u odnosima — na poslu, u obitelji i s prijateljima.",
    cijenaEur: 99,
    trajanje: "4 tjedna",
    razina: "Početna",
    status: "active",
    modules: [
      {
        id: "m1",
        title: "Zašto nam je teško",
        lessons: [
          { id: "l1", title: "Odakle dolazi krivnja", duration: "6:20" },
          { id: "l2", title: "Granice nisu zidovi", duration: "8:10" },
        ],
      },
      {
        id: "m2",
        title: "Vještine u praksi",
        lessons: [
          { id: "l3", title: "Formula za 'ne' bez isprike", duration: "9:44" },
          { id: "l4", title: "Kad druga strana gura natrag", duration: "11:02" },
          { id: "l5", title: "Vježba: tri granice ovaj tjedan", duration: "5:15" },
        ],
      },
    ],
    assets: [
      { id: "a1", kind: "PDF", title: "Radni list — moje granice" },
      { id: "a2", kind: "AUDIO", title: "Vođena vizualizacija (9 min)" },
    ],
    reflection: [
      "Gdje ovaj tjedan najčešće popuštaš granicu koju bi želio/la zadržati?",
      "Što se bojiš da će se dogoditi ako kažeš ne?",
      "Kako se osjećaš u tijelu neposredno prije nego popustiš?",
    ],
  },
  {
    id: "anksioznost",
    title: "Smiri anksioznost",
    tagline: "Razumij anksioznost i razvij vještine da njome upravljaš.",
    description:
      "Program u pripremi — javit ćemo ti se čim krene. Ostavi upit putem kontakta ako te zanima rani pristup.",
    cijenaEur: 129,
    trajanje: "5 tjedana",
    razina: "Za sve razine",
    status: "soon",
    modules: [],
    assets: [],
    reflection: [],
  },
];

export const programiById = Object.fromEntries(
  programi.map((p) => [p.id, p]),
);

/** Ukupan broj lekcija u programu (za progress). */
export function brojLekcija(program) {
  if (!program) return 0;
  return program.modules.reduce((n, m) => n + m.lessons.length, 0);
}
