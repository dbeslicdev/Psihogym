// The build exposes only the public outline of each course.
import catalog from "virtual:psihogym-programs";
import { programPrice } from "./content/program-pricing.js";

/** Sav sadržaj stranice na jednom mjestu — preslikan iz originala. */

// Redoslijed tema: od unutarnjeg prema odnosima.
export const podrucja = [
  {
    num: "01",
    title: ["Anksioznost"],
    desc: "Pomažem ti razumjeti što ti se događa i istražiti što možeš učiniti kad ti je teško.",
  },
  {
    num: "02",
    title: ["Stres"],
    desc: "Pomažem ti usporiti i lakše se nositi sa svakodnevnim pritiscima.",
  },
  {
    num: "03",
    title: ["Samopouzdanje"],
    desc: "Pomažem ti graditi bolji odnos prema sebi.",
  },
  {
    num: "04",
    title: ["Zauzimanje", "za sebe"],
    desc: "Pomažem ti izraziti svoje potrebe i postaviti zdrave granice.",
  },
  {
    num: "05",
    title: ["Odnosi"],
    desc: "Pomažem ti njegovati zdravije odnose s ljudima oko sebe.",
  },
  {
    num: "06",
    title: ["Roditeljstvo"],
    desc: "Pomažem ti pronaći topliji i jasniji odgojni jezik.",
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
    // PROBA: pola kartica "centered" (5), pola "marker" (9, istaknuta misao s markerom)
    design: "centered",
    textMark: "promjenilo je kvalitetu mog života i života moje obitelji nabolje.",
    text: "Odlasci na individualno savjetovanje u Psihogym, promjenilo je kvalitetu mog života i života moje obitelji nabolje. Ivana je profesionalna, empatična i u potpunosti predana klijentu. Predivno iskustvo koje ostavlja duboki trag...Hvala na svemu draga Ivana. Zauvijek ćete ostati dio našeg života.",
  },
  {
    name: "Barbara H.",
    design: "centered",
    // Centrirane kartice: najvažniji dio teksta podcrtan markerom (točno kako piše u recenziji).
    textMark: "jako topla i draga",
    text: "Ivana je jako topla i draga, te vrlo pristupačna i susretljiva. Tople preporuke za ovu divnu ženu.",
  },
  {
    name: "Andrea D.",
    design: "centered",
    textMark: "Postavili smo itekako dobre temelje za suočavanje sa svime što život nosi.",
    text: "Toplo preporučujem Psihogym i psihoterapeutkinju Ivanu svima koji osjećaju da im treba podrška u životu. Ivana je strpljiva, ljubazna i profesionalna te mi je pružila potporu u mom nastojanju da budem bolja verzija sebe. Postavili smo itekako dobre temelje za suočavanje sa svime što život nosi. Velika preporuka! :)",
  },
  {
    name: "Gabrijela Stella S.",
    design: "centered",
    textMark: "alate za nošenje sa životnim problemima koje ću koristit cijeli život",
    highlight: "koji mi je dao alate za nošenje sa životnim problemima.",
    mark: "Centar unutarnje snage",
    text: "Psihogym je za mene definitivno bio centar unutarnje snage koji mi je dao alate za nošenje sa životnim problemima koje ću koristit cijeli život. Toplo preporučujem psihoterapeuticu Ivanu svakom tko se osjeća izgubljeno i potrebna mu je podrška i pomoć da izgradi sebe iznova u najboljem svjetlu kojem može!",
  },
  {
    name: "Željka A.",
    design: "centered",
    textMark: "Pomogla je mojoj kćeri u najtežim trenucima",
    text: "Upoznali smo Ivanu i njenu terapiju prije 2 godine. Pomogla je mojoj kćeri u najtežim trenucima. S se osjećala ugodno, imala je potpuno povjerenje i što je najvažnije nakon razgovora osjećala se puno bolje. Mi kao roditelji bili smo također jako zadovoljni. Svaka preporuka od nas.",
  },
  {
    name: "Željka A.",
    design: "centered",
    textMark: "Pomogla je mojoj kćeri u najtežim trenucima",
    text: "Upoznali smo Ivanu i njenu terapiju prije 2 godine. Pomogla je mojoj kćeri u najtežim trenucima. S se osjećala ugodno, imala je potpuno povjerenje i što je najvažnije nakon razgovora osjećala se puno bolje. Mi kao roditelji bili smo također jako zadovoljni. Svaka preporuka od nas.",
  },
];

export const mitovi = [
  {
    mit: "Individualni rad je samo razgovor u kojem ti netko govori što da radiš",
    istina:
      "Nema gotovih rješenja. Pomažem ti da dođeš do svojih odgovora, a ti u tome aktivno sudjeluješ.",
  },
  {
    mit: "Rad na sebi dugo traje",
    istina:
      "Nekad je dovoljno nekoliko susreta, nekad treba više. Sve ovisi o tebi i tvojoj situaciji.",
  },
  {
    mit: "Rad na sebi je lagan i ugodan",
    istina:
      "Nekad je teško i neugodno, i to je u redu. Radiš na stvarima koje su ti važne.",
  },
  {
    mit: "Ako se poteškoće vrate, rad nije uspio",
    istina:
      "Povratak poteškoća ne znači da si opet na početku. To je dio procesa.",
  },
  {
    mit: "Napredak je linearan",
    istina:
      "Napredak nije ravna crta. Ima uspona i padova, a to ne znači da ne ideš naprijed.",
  },
  {
    mit: "Postoji jedan ispravan put",
    istina:
      "Nema univerzalne formule. Ono što pomaže drugima, tebi možda neće. Svačiji je put drugačiji.",
  },
  {
    mit: "To je isto kao razgovor s prijateljem",
    istina:
      "Prijatelj te može saslušati, a ja u radu koristim stručno znanje i provjerene metode.",
  },
  {
    mit: "Pomoć traže oni koji se ne mogu nositi s problemima",
    istina:
      "Ljudi obično traže pomoć zato što se žele suočiti s problemima, a ne zato što su nemoćni.",
  },
  {
    mit: "Dovoljno je uključiti se na susret",
    istina:
      "Susreti su važni, ali najviše se mijenja između njih, kad isprobavaš ono o čemu smo razgovarali.",
  },
  {
    mit: "Rad na sebi je preskup",
    istina: "Rad na sebi ima dugoročnu vrijednost. Ako ti individualni rad trenutno nije opcija, online programi su pristupačniji način da kreneš.",
  },
];

export const podrucjaOpcije = [
  "Anksioznost",
  "Stres",
  "Samopouzdanje",
  "Zauzimanje za sebe",
  "Odnosi",
  "Roditeljstvo",
];

const numberForms = new Intl.PluralRules("hr");
function counted(value, one, few, other) {
  const form = numberForms.select(value);
  return `${value} ${form === "one" ? one : form === "few" ? few : other}`;
}

const cardTaglines = {
  "emocionalni-razvoj": "Nauči prepoznati svoje emocije, razumjeti njihovu ulogu i upravljati njima kad te preplave.",
  anksioznost: "Nauči razumjeti svoju anksioznost, lakše se nositi s brigama i bolje brinuti o sebi.",
  stres: "Nauči prepoznati što te opterećuje, posložiti svoje prioritete i pronaći više prostora za sebe.",
  odnosi: "Nauči se zauzimati za sebe, otvoreno izražavati svoje potrebe i postavljati zdrave granice.",
  samopouzdanje: "Nauči graditi bolji odnos prema sebi, utišati unutarnjeg kritičara i više vjerovati u svoje sposobnosti.",
};

// Broj samorefleksija u dnevniku svakog programa (za "Što dobivaš?").
const reflections = { "emocionalni-razvoj": 2, anksioznost: 3, stres: 3, samopouzdanje: 2, odnosi: 2 };
// "s" ili "sa": "sa" ispred broja koji se izgovara sa s/š (6, 7, 16, 17, 60–79).
const withNumber = n => (/^(6|7|16|17|[67]\d)$/.test(String(n)) ? "sa" : "s");

// Redoslijed kao u temama: od unutarnjeg prema odnosima.
const programOrder = ["emocionalni-razvoj", "anksioznost", "stres", "samopouzdanje", "odnosi"];
const orderOf = id => { const i = programOrder.indexOf(id); return i < 0 ? programOrder.length : i; };

export const programi = [...catalog].sort((a, b) => orderOf(a.id) - orderOf(b.id)).map(program => {
  const lessons = program.modules.flatMap(module => module.lessons);
  return {
    ...program,
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
  const { exercises } = program.workbook;
  const refl = reflections[program.id];
  const benefits = [
    `${counted(program.modules.length, "modul", "modula", "modula")} s ukupno ${counted(program.videoCount, "psihoedukativnom videolekcijom", "psihoedukativne videolekcije", "psihoedukativnih videolekcija")}`,
    `${program.workbook.title} ${withNumber(exercises)} ${counted(exercises, "vježbom", "vježbe", "vježbi")}${refl ? ` te ${counted(refl, "samorefleksijom", "samorefleksije", "samorefleksija")} za praćenje napretka` : ""}`,
  ];
  if (program.bonusCount) benefits.push(program.bonusCount === 1 ? "bonus videolekciju" : `${program.bonusCount} bonus videolekcije`);
  benefits.push("potvrdu o završetku izazova");
  return benefits;
}
