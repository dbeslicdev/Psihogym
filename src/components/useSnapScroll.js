import { useEffect, useRef } from "react";
import { createWheelGesture } from "./wheelGesture.js";
import { glideTo, jumpTo } from "../smoothScroll.js";

/* Cinematic scroll (uključen po zadanom, ?snap=0 isključuje): jedan potez kotačića ili
   touchpada, bilo koje jačine, vodi na sljedeću logičku cjelinu ("stanicu").
   Stanice se izvode iz sekcija stranice:
    - sekcija niža od ekrana stoji sa sadržajem na sredini; dvije (ili više) kratkih
      koje zajedno stanu na ekran dijele jednu stanicu;
    - sekcija viša od ekrana počinje od vrha i dobiva međustanice (~85 % ekrana),
      da se ništa ne preskoči;
    - zaključana galerija programa (naslovnica): početak zone i svaka kartica;
      katalog (kontinuirano listanje): kartica po kartica;
    - Teme (naslovnica): red po red, s ljepljivim naslovom već na mjestu;
    - recenzije (naslovnica): kartica po kartica na ljepljivom mjestu;
    - dno stranice.
   Samo za miš/touchpad na širokim ekranima; dodir i tipkovnica ostaju kako jesu.
   Na naslovnici se poziva PRIJE useProgramRail, pa njegov wheel slušatelj prvi
   dobije događaj i u snap načinu zaustavi galerijin (stopImmediatePropagation). */
export default function useSnapScroll(getRoot, { enabled = false, key = "" } = {}) {
  // getRoot smije biti nova funkcija pri svakom renderu: efekt ne ovisi o njoj, inače bi
  // svaki render stranice (npr. ulazak sekcije) prekinuo skok i ponovno montirao slušatelje.
  const getRootRef = useRef(getRoot);
  getRootRef.current = getRoot;
  useEffect(() => {
    const root = enabled ? getRootRef.current() : null;
    if (!root) return;
    const compact = matchMedia("(pointer: coarse), (max-width: 60rem)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    const gesture = createWheelGesture();
    const stepScroll = 200; // isto kao u useProgramRail (stepped)
    let stops = [];
    let animating = false;
    let guard;
    let currentTarget = null; // odredište skoka u tijeku (za preusmjeravanje)
    let currentDirection = 0;
    let measureFrame;

    const measure = () => {
      measureFrame = undefined;
      const vh = innerHeight;
      const list = [0];
      // Sekcije najviše razine (ugniježđene, npr. odlomci pravnih tekstova, idu uz roditelja).
      const sections = [...root.querySelectorAll("section")].filter(s => !s.parentElement.closest("section") || s.parentElement.closest("section") === null);
      /* Stanice ne smiju ovisiti o tome gdje se stranica trenutno nalazi (inače put
         prema gore nije isti kao prema dolje):
         - sekcija s data-ride-wave (Online) negativnom marginom (--content-lift)
           povlači sve ispod sebe dok val raste; položaji se svode na konačno stanje
           (puni lift), a njezin vlastiti sadržaj na nepodignuto stanje;
         - koraci recenzija su position: sticky, pa se njihov tok računa iz visina i
           margina, ne iz trenutnog (zalijepljenog) položaja. */
      const maxLift = Math.min(vh * .18, 200); // kao requestedLift u kit.jsx
      let pending = 0; // koliko će sekcije ispod još biti povučene gore do konačnog stanja
      const toFinal = (y) => Math.round(y - pending);
      // Sadržaj sekcije (sve osim površine vala): njegova sredina ide na sredinu ekrana.
      const contentCentre = (section, rect) => {
        let top = Infinity;
        let bottom = -Infinity;
        for (const child of section.children) {
          if (child.classList.contains("v4-circle")) continue;
          const r = child.getBoundingClientRect();
          if (r.height <= 0) continue;
          top = Math.min(top, r.top);
          bottom = Math.max(bottom, r.bottom);
        }
        return scrollY + (top === Infinity ? rect.top + rect.height / 2 : (top + bottom) / 2);
      };
      // Visoka sekcija: od vrha, pa međustanice; zadnja tako da joj je dno na dnu ekrana.
      const tallStops = (top, height) => {
        const step = vh * .85;
        const last = top + height - vh; // dno sekcije na dnu ekrana: uvijek stanica
        const out = [top];
        for (let y = top + step; y < last; y += step) out.push(y);
        // Međustanica preblizu zadnjoj otpada ako prethodna i dalje pokriva sve do nje
        // (nema preskočenog sadržaja).
        const kept = [out[0]];
        for (let k = 1; k < out.length; k++) {
          if (last - out[k] < vh * .4 && last - kept[kept.length - 1] <= vh) continue;
          kept.push(out[k]);
        }
        // Zadnja stanica preblizu prethodnoj (samo donji rub sekcije) ne vrijedi poteza.
        if (last - kept[kept.length - 1] > vh * .15) kept.push(last);
        return kept;
      };
      const shownWithPrevious = new Set();
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        const top = Math.round(rect.top + scrollY);
        const ownLift = section.hasAttribute("data-ride-wave") ? parseFloat(section.style.getPropertyValue("--content-lift")) || 0 : 0;
        const liftBelow = () => { if (section.hasAttribute("data-ride-wave")) pending += maxLift - ownLift; };
        if (shownWithPrevious.has(section)) { liftBelow(); continue; }
        if (section.classList.contains("v4-programi") && !section.classList.contains("v4-programi--static")) {
          const sticky = section.querySelector(".v4-programi__sticky");
          const pinTop = parseFloat(getComputedStyle(sticky).top) || 0;
          const zoneStart = toFinal(top - pinTop);
          if (section.classList.contains("v4-programi--stepped")) {
            // Zaključana galerija: stanica na početku zone i za svaku karticu (korak = 200 px).
            const lastStep = Math.max(0, Math.round((section.offsetHeight - vh) / stepScroll));
            for (let k = 0; k <= lastStep; k++) list.push(zoneStart + k * stepScroll);
          } else {
            // Katalog: kontinuirano listanje, pomak stranice = pomak trake; stanica po kartici.
            const track = section.querySelector(".v4-programi__track");
            const viewport = section.querySelector(".v4-programi__viewport");
            const maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth);
            const card = track.children[0];
            const cardStep = card ? card.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0) : maxOffset;
            for (let offset = 0; offset < maxOffset - 2 && cardStep > 0; offset += cardStep) list.push(zoneStart + Math.round(offset));
            list.push(zoneStart + Math.round(maxOffset));
          }
          liftBelow();
          continue;
        }
        if (section.classList.contains("v4-podrucja")) {
          // Teme: stanica po redu kartica (dvije po redu). Red stoji u pojasu u kojem su
          // kartice potpuno vidljive (useRefinedSections: ulaz do .77vh, izlaz od .52vh),
          // prethodni red je već izblijedio, sljedeći tek proviruje odozdo.
          const rows = new Map();
          for (const chip of section.querySelectorAll(".v4-chip")) {
            const r = chip.getBoundingClientRect();
            const key = Math.round((r.top + scrollY) / 20);
            if (!rows.has(key)) rows.set(key, r.top + scrollY + r.height / 2);
          }
          if (rows.size) {
            // Ljepljivi naslov već na prvoj stanici stoji na svom mjestu gore (a ne u
            // toku pa tek sljedećim potezom zalijepljen): stanica ne smije biti iznad
            // točke na kojoj se naslov zalijepi (tok naslova − njegov sticky top).
            const heading = section.querySelector(".pg-topics-heading");
            const headingStyle = heading && getComputedStyle(heading);
            const stuckAt = heading && headingStyle.position === "sticky"
              ? top + (parseFloat(getComputedStyle(section).paddingTop) || 0) - (parseFloat(headingStyle.top) || 0)
              : -Infinity;
            for (const centre of rows.values()) list.push(toFinal(Math.max(centre - vh * .62, stuckAt)));
            liftBelow();
            continue;
          }
        }
        if (section.classList.contains("v4-iskustva") && section.dataset.reviewLayout === "sticky") {
          // Svaka recenzija: kartica sjedne na svoje ljepljivo mjesto ispod naslova
          // (naslov je ljepljiv, pa nema zasebne stanice za vrh sekcije). Tok koraka
          // računa se unatrag od dna sekcije: visina + donja margina svakog koraka.
          const stackTop = parseFloat(section.style.getPropertyValue("--stack-top")) || 0;
          const steps = [...section.querySelectorAll(".v4-step")];
          let flow = section.offsetHeight - (parseFloat(getComputedStyle(section).paddingBottom) || 0);
          const flowTops = [];
          for (let k = steps.length - 1; k >= 0; k--) {
            flow -= steps[k].offsetHeight + (parseFloat(getComputedStyle(steps[k]).marginBottom) || 0);
            flowTops.unshift(flow);
          }
          for (const flowTop of flowTops) list.push(toFinal(top + flowTop - stackTop));
          liftBelow();
          continue;
        }
        if (rect.height >= vh) {
          for (const y of tallStops(top, rect.height)) list.push(toFinal(y));
          liftBelow();
          continue;
        }
        // Kratka sekcija: sadržaj (u nepodignutom stanju: + ownLift) na sredini ekrana.
        let stop = contentCentre(section, rect) + ownLift - vh / 2;
        // Kratke sekcije koje zajedno stanu na ekran dijele stanicu (Online + Detalji;
        // odlomci pravnih tekstova): sljedeći potez ide odmah dalje. Sredina ostaje na
        // prvoj, ali dno skupine ne smije ispasti ispod ekrana.
        let groupBottom = top + rect.height;
        let j = i + 1;
        while (j < sections.length) {
          const candidate = sections[j];
          const special = candidate.classList.contains("v4-programi") || candidate.classList.contains("v4-podrucja") || candidate.classList.contains("v4-iskustva");
          const cRect = candidate.getBoundingClientRect();
          if (special || cRect.bottom + scrollY - top > vh) break;
          shownWithPrevious.add(candidate);
          groupBottom = cRect.bottom + scrollY;
          j++;
        }
        if (j > i + 1) stop = Math.min(stop, groupBottom - vh);
        const next = sections[j];
        if (next && j === i + 1) {
          const nextRect = next.getBoundingClientRect();
          if (nextRect.height >= vh) {
            // Visoka sljedeća sekcija ostaje ispod ruba ekrana: njezin "oblačić" (val)
            // pojavi se tek sljedećim potezom.
            stop = Math.min(stop, nextRect.top + scrollY - vh);
          }
        }
        list.push(Math.max(0, toFinal(stop)));
        liftBelow();
      }
      // Stranica bez sekcija (ili s jednom vrlo dugom bez stanica): ekran po ekran.
      if (sections.length === 0) {
        const total = document.documentElement.scrollHeight;
        for (let y = vh * .85; y < total - vh; y += vh * .85) list.push(Math.round(y));
      }
      // Dno stranice: cilj se razriješi tek pri skoku (visina dokumenta se mijenja s valom
      // završne sekcije), zato beskonačno.
      // Stanica tik uz dno stranice otpada (dno je ionako stanica).
      const nearEnd = document.documentElement.scrollHeight - vh - vh * .1;
      stops = [...new Set(list.map(y => Math.max(0, Math.round(y))))].filter(y => y < nearEnd).sort((a, b) => a - b);
      stops.push(Infinity);
    };
    // Samo u razvoju: uvid u stanice iz konzole (window.__snapStops()).
    if (import.meta.env.DEV) window.__snapStops = () => { measure(); return stops; };
    const schedule = () => { if (measureFrame === undefined) measureFrame = requestAnimationFrame(measure); };

    const finish = () => {
      clearTimeout(guard);
      animating = false;
      currentTarget = null;
    };
    /* Potez koji stigne usred skoka ne čeka kraj (to je izgledalo kao da stranica
       "sama" nastavlja gore-dolje), nego odmah preusmjeri skok: u istom smjeru na
       stanicu iza trenutnog odredišta, u suprotnom na prvu stanicu natrag od mjesta
       gdje je stranica sad. */
    const go = (direction) => {
      // Stanice se mjere svježe pri svakom potezu (jedno čitanje geometrije): položaji
      // se mijenjaju s fontovima i sadržajem (npr. otvorena harmonika).
      measure();
      const y = Math.round(scrollY);
      const from = animating && currentTarget !== null && direction === currentDirection ? currentTarget : y;
      let target;
      if (direction > 0) target = stops.find(s => s > from + 2);
      else target = [...stops].reverse().find(s => s < from - 2);
      if (target === undefined) return;
      if (!Number.isFinite(target)) target = document.documentElement.scrollHeight - innerHeight;
      if (Math.abs(target - y) < 4) return; // dno stranice zna "disati" za piksel s valom završne sekcije
      clearTimeout(guard);
      animating = true;
      currentTarget = target;
      currentDirection = direction;
      // Najava odredišta: ulazne animacije (naslovi, otkrivanja) kreću odmah, da su
      // gotove kad stranica sjedne na stanicu.
      window.dispatchEvent(new CustomEvent("pg:snap-glide", { detail: { target } }));
      const duration = Math.min(1.1, .45 + Math.abs(target - y) / 1800);
      glideTo(target, { duration, onComplete: finish });
      // Zaštita: ako galerija na rubu zone prekine animaciju trenutačnim skokom
      // (jumpTo), onComplete ne stigne; stanica je ionako ista.
      guard = setTimeout(finish, duration * 1000 + 150);
    };

    const onWheel = (event) => {
      if (compact.matches || motion.matches || event.ctrlKey) return;
      // Polja za unos i elementi s vlastitim pomicanjem (npr. textarea) zadržavaju kotačić.
      if (event.target instanceof Element) {
        const own = event.target.closest("textarea, select, [data-lenis-prevent]");
        if (own && (own.tagName !== "TEXTAREA" || own.scrollHeight > own.clientHeight + 1)) return;
      }
      const read = gesture.read(event);
      if (!read) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!read.fresh) return;
      const direction = read.delta > 0 ? 1 : -1;
      go(direction);
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false, signal: controller.signal });
    window.addEventListener("resize", schedule, { passive: true, signal: controller.signal });
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    document.fonts?.ready.then(schedule);
    measure();
    return () => {
      controller.abort();
      observer.disconnect();
      clearTimeout(guard);
      cancelAnimationFrame(measureFrame);
      if (animating) jumpTo(scrollY);
    };
  }, [enabled, key]);
}
