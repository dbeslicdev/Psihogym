// The build exposes only the public outline of each course.
import catalog from "virtual:psihogym-programs";
import { programPrice } from "./content/program-pricing.js";

/** Sav sadržaj stranice na jednom mjestu — preslikan iz originala. */

export const podrucja = [
  {
    num: "01",
    title: ["Odnosi"],
    desc: "Pomažemo ti graditi bolje odnose s ljudima oko sebe.",
  },
  {
    num: "02",
    title: ["Anksioznost"],
    desc: "Pomažemo ti razumjeti što ti se događa i pronaći načine da se lakše nosiš s onim što osjećaš.",
  },
  {
    num: "03",
    title: ["Samopouzdanje"],
    desc: "Pomažemo ti graditi bolji odnos sa sobom.",
  },
  {
    num: "04",
    title: ["Zauzimanje", "za sebe"],
    desc: "Pomažemo ti izraziti svoje potrebe i postaviti zdrave granice.",
  },
  {
    num: "05",
    title: ["Stres"],
    desc: "Pomažemo ti usporiti i ponovno se povezati sa sobom.",
  },
  {
    num: "06",
    title: ["Roditeljstvo"],
    desc: "Pomažemo ti pronaći svoj odgojni jezik.",
  },
];

export const stats = [
  { value: 7, suffix: "+", label: "Godina iskustva" },
  { value: 200, suffix: "+", label: "Klijenata" },
  { value: 3200, suffix: "+", label: "Sati savjetovanja" },
  { value: 5, suffix: "", label: "Programa" },
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
      "Nekad je teško i neugodno – ali to je ok. Radiš na stvarima koje su ti važne.",
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
  "Odnosi",
  "Anksioznost",
  "Samopouzdanje",
  "Zauzimanje za sebe",
  "Stres",
  "Roditeljstvo",
];

const numberForms = new Intl.PluralRules("hr");
function counted(value, one, few, other) {
  const form = numberForms.select(value);
  return `${value} ${form === "one" ? one : form === "few" ? few : other}`;
}

const cardTaglines = {
  "emocionalni-razvoj": "Bolje razumijevanje, upravljanje i izražavanje emocija.",
  anksioznost: "Razumij i preuzmi kontrolu nad anksioznošću.",
  stres: "Uspori i vrati si prostor.",
  odnosi: "Gradi odnose u kojima ti je dobro.",
  samopouzdanje: "Bolji odnos sa sobom, korak po korak.",
};

export const programi = catalog.map(program => {
  const lessons = program.modules.flatMap(module => module.lessons);
  return {
    ...program,
    razina: "Za sve razine",
    trajanje: counted(program.days, "dan", "dana", "dana"),
    tagline: cardTaglines[program.id],
    videoCount: lessons.filter(lesson => lesson.type === "video").length,
    bonusCount: lessons.filter(lesson => lesson.type === "bonus").length,
    get cijenaEur() { return programPrice(program); },
  };
});

export const programiById = Object.assign(
  Object.create(null), Object.fromEntries(programi.map(p => [p.id, p])),
);

export function brojLekcija(program) {
  return program ? program.videoCount + program.bonusCount : 0;
}

export function pogodnostiPrograma(program) {
  const benefits = [
    counted(program.modules.length, "modul", "modula", "modula"),
    counted(program.videoCount, "psihoedukativna videolekcija", "psihoedukativne videolekcije", "psihoedukativnih videolekcija"),
  ];
  if (program.bonusCount) benefits.push(counted(program.bonusCount, "bonus lekcija", "bonus lekcije", "bonus lekcija"));
  benefits.push(`${program.workbook.title} · ${counted(program.workbook.exercises, "vježba", "vježbe", "vježbi")}`, "Potvrda o završetku programa");
  return benefits;
}
