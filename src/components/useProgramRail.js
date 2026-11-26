import { useEffect } from "react";
import { jumpTo } from "../smoothScroll.js";

/* stepped (naslovna): zaključana galerija se lista korak po korak. Jedan potez
   kotačića ili touchpada pomakne točno jednu karticu; nakon zadnje kartice
   stranica nastavlja dalje. Bez stepped (katalog) ostaje kontinuirano listanje. */
export default function useProgramRail(pinRef, trackRef, progressRef, { stepped = false } = {}) {
  useEffect(() => {
    const section = pinRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const viewport = section.querySelector(".v4-programi__viewport");
    const head = section.querySelector(".v4-programi__head");
    // Niski laptopi (npr. 1366×768 ili skaliranje 125–150 %) zadržavaju zaključanu galeriju:
    // kartice se smanje (--rail-fit) dok ne stanu po visini. Statično samo ako ni tako ne stanu.
    const compact = window.matchMedia("(pointer: coarse), (max-width: 60rem)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const outer = new AbortController();
    const sticky = section.querySelector(".v4-programi__sticky");
    let staticMode;
    const minFit = 0.7;
    let maxOffset = 0;
    let pinTop = 0;
    let frame;
    let measureFrame;
    let lastOffset = -1;
    let wheelFrame;
    let wheelTarget;
    let wheelTime;
    let wheelPosition;
    // --- stepped ---
    const stepScroll = 200; // koliko se stranica pomakne po kartici (nevidljivo, sekcija stoji)
    let step = -1;
    let lastStep = 0;
    let stepSize = 0;
    let visible = 2;
    let previousY = scrollY;
    let lastWheel = 0;
    let gesture = "pass"; // trenutni potez kotačića ide stranici ("pass") ili galeriji ("swallow")
    const zoneStart = () => section.getBoundingClientRect().top + scrollY - pinTop;
    // Traka napretka: vidljiva (fade-in) dok je galerija zaključana; nestaje (fade-out)
    // kad se prema dolje dođe do zadnje kartice. Pri povratku odozdo opet je puna
    // i smanjuje se korak po korak.
    let railEnd = false;
    let railActive = false;
    const setRailEnd = (value) => {
      railEnd = value;
      section.classList.toggle("is-rail-end", value);
    };
    const setRailActive = (value) => {
      if (value === railActive) return;
      railActive = value;
      section.classList.toggle("is-rail-active", value);
      // Svaki novi ulazak u galeriju (i odozdo, i kad Lenis stane točno na rubu) kreće s vidljivom trakom.
      if (value) setRailEnd(false);
    };
    const setStep = (next) => {
      next = Math.max(0, Math.min(lastStep, next));
      if (next === step) return;
      const previous = step;
      step = next;
      track.style.transform = `translate3d(${(-step * stepSize).toFixed(2)}px,0,0)`;
      // Traka je pomaknuta za jedan korak: već na prvom prikazu pokazuje dio puta,
      // a puna je na zadnjoj kartici.
      if (progressRef.current) progressRef.current.style.width = `${(step + 1) / (lastStep + 1) * 100}%`;
      [...track.children].forEach((card, index) => {
        card.classList.toggle("is-offstage", index < step || index >= step + visible);
      });
      // Nestaje samo kad se do zadnje kartice dođe prema naprijed; svaki korak natrag je vraća.
      if (previous < 0 || step < previous) setRailEnd(false);
      else setRailEnd(lastStep > 0 && step === lastStep);
    };
    const goToStep = (next) => {
      next = Math.max(0, Math.min(lastStep, next));
      setStep(next);
      jumpTo(zoneStart() + next * stepScroll);
      previousY = scrollY;
      setRailActive(true);
    };
    const stopWheel = () => {
      if (wheelFrame !== undefined) cancelAnimationFrame(wheelFrame);
      wheelFrame = undefined;
      wheelTarget = undefined;
      wheelTime = undefined;
      wheelPosition = undefined;
    };
    const animateWheel = (time) => {
      wheelFrame = undefined;
      if (!staticMode || wheelTarget === undefined) { stopWheel(); return; }
      const dt = Math.min(64, wheelTime === undefined ? 16 : time - wheelTime);
      wheelTime = time;
      if (wheelPosition !== undefined && Math.abs(viewport.scrollLeft - wheelPosition) > 2) { stopWheel(); return; }
      wheelPosition ??= viewport.scrollLeft;
      const remaining = wheelTarget - wheelPosition;
      if (Math.abs(remaining) < .5) {
        viewport.scrollLeft = wheelTarget;
        stopWheel();
        return;
      }
      // Time-based easing matches the page's Lenis feel at any refresh rate.
      wheelPosition += remaining * (1 - Math.exp(-dt / 95));
      viewport.scrollLeft = wheelPosition;
      wheelFrame = requestAnimationFrame(animateWheel);
    };
    const updatePin = () => {
      frame = undefined;
      if (staticMode) return;
      if (stepped) {
        const start = zoneStart();
        const end = start + lastStep * stepScroll;
        const y = scrollY;
        // Ulazak u galeriju glatkim scrollom: stani na početku (odozgo) ili na kraju
        // (odozdo), da zalet ne preskoči kartice. Veliki skok (poveznice) se ne dira,
        // osim ako ga je pokrenuo kotačić/touchpad (brzi zalet).
        // Rub se računa uključivo: kadar koji padne točno na rub inače bi propustio
        // ostatak zaleta kroz cijelu galeriju.
        if (Math.abs(y - previousY) < innerHeight * .5 || performance.now() - lastWheel < 200) {
          if (previousY < start && y >= start) { gesture = "swallow"; goToStep(0); return; }
          // Povratak odozdo: zadnja kartica s punom, vidljivom trakom.
          if (previousY > end && y <= end) { gesture = "swallow"; setRailEnd(false); goToStep(lastStep); return; }
        }
        previousY = y;
        setStep(Math.round((y - start) / stepScroll));
        setRailActive(y >= start - 2 && y <= end + 2);
        return;
      }
      const offset = Math.min(Math.max(pinTop - section.getBoundingClientRect().top, 0), maxOffset);
      if (Math.abs(offset - lastOffset) < 0.01) return;
      lastOffset = offset;
      track.style.transform = `translate3d(${-offset.toFixed(3)}px,0,0)`;
      if (progressRef.current) progressRef.current.style.width = `${maxOffset ? offset / maxOffset * 100 : 100}%`;
    };
    const paint = () => {
      if (frame === undefined) frame = requestAnimationFrame(updatePin);
    };
    const apply = () => {
      measureFrame = undefined;
      // Probe the desktop geometry without clearing the current rail transform
      // or section height. Hover/ResizeObserver notifications must not reset it.
      section.classList.remove("v4-programi--static");
      const stickyStyle = getComputedStyle(sticky);
      const viewportStyle = getComputedStyle(viewport);
      pinTop = parseFloat(stickyStyle.top) || 0;
      const grid = stickyStyle.display === "grid";
      // Mreža ima jedan razmak (kartice | traka napretka), stupac dva (naslov | kartice | traka).
      const reserve = parseFloat(stickyStyle.paddingTop) + parseFloat(stickyStyle.paddingBottom)
        + (grid ? 1 : 2) * parseFloat(stickyStyle.rowGap) + parseFloat(viewportStyle.paddingTop)
        + parseFloat(viewportStyle.paddingBottom) + progressRef.current.parentElement.offsetHeight;
      // Visina kartica mjeri se u punoj veličini (bez --rail-fit), pa se faktor ponovno
      // postavi; ista vrijednost na kraju okvira ne okida ResizeObserver (nema petlje).
      section.classList.toggle("v4-programi--stepped", stepped);
      if (stepped) {
        // Cijele kartice + izblijedjeli rub sljedeće. Broj vidljivih prati širinu:
        // jedna na užem stupcu, dvije na laptopu, tri na velikom monitoru.
        const trackStyle = getComputedStyle(track);
        const gap = parseFloat(trackStyle.columnGap) || 0;
        const width = viewport.clientWidth - parseFloat(trackStyle.paddingLeft) - parseFloat(trackStyle.paddingRight);
        const peek = Math.max(28, Math.min(64, width * .06));
        // Najmanji broj kartica uz koji kartica nije šira od 580 px (ni uža od 300 px).
        const widthFor = (count) => Math.floor((width - peek - count * gap) / count);
        visible = 1;
        while (visible < track.children.length && widthFor(visible) > 580 && widthFor(visible + 1) >= 300) visible++;
        const cardWidth = widthFor(visible);
        section.style.setProperty("--rail-card-w", cardWidth + "px");
        section.style.setProperty("--rail-peek", peek + "px");
        stepSize = cardWidth + gap;
        lastStep = Math.max(0, track.children.length - visible);
      }
      const currentFit = section.style.getPropertyValue("--rail-fit");
      section.style.removeProperty("--rail-fit");
      const trackHeight = track.offsetHeight;
      const headHeight = head?.offsetHeight || 0;
      const room = innerHeight - reserve - pinTop;
      const fit = grid ? Math.min(1, Math.floor(room / trackHeight * 1000) / 1000) : 1;
      const fits = grid ? headHeight <= room && fit >= minFit : headHeight + trackHeight <= room;
      const nextStatic = compact.matches || motion.matches || !fits;
      if (!nextStatic && fit < 1) section.style.setProperty("--rail-fit", String(fit));
      else if (currentFit) section.style.removeProperty("--rail-fit");
      const changed = nextStatic !== staticMode;
      staticMode = nextStatic;
      if (changed || !staticMode) stopWheel();
      section.classList.toggle("v4-programi--static", staticMode);
      if (staticMode) {
        section.style.height = "";
        track.style.transform = "";
        if (progressRef.current) progressRef.current.style.width = "";
        lastOffset = -1;
        step = -1;
        [...track.children].forEach(card => card.classList.remove("is-offstage"));
      } else if (stepped) {
        const height = `${innerHeight + lastStep * stepScroll}px`;
        if (section.style.height !== height) section.style.height = height;
        if (changed) viewport.scrollLeft = 0;
        // Nova geometrija: ponovno postavi korak koji odgovara položaju stranice.
        step = -1;
        previousY = scrollY;
        setStep(Math.round((scrollY - zoneStart()) / stepScroll));
      } else {
        maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth);
        const height = `${(section.dataset.fitContent === "true" ? sticky.offsetHeight : innerHeight) + maxOffset}px`;
        if (section.style.height !== height) section.style.height = height;
        if (changed) { viewport.scrollLeft = 0; lastOffset = -1; }
        updatePin();
      }
    };
    const schedule = () => {
      if (measureFrame === undefined) measureFrame = requestAnimationFrame(apply);
    };
    // Pointer focus happens before click. Moving a clipped card here would
    // move its link away from the pointer and can swallow the first click.
    // Only keyboard navigation should reveal and centre a focused card.
    let keyboardNavigation = false;
    window.addEventListener("keydown", (event) => {
      if (event.key === "Tab") keyboardNavigation = true;
    }, { capture: true, signal: outer.signal });
    window.addEventListener("pointerdown", () => {
      keyboardNavigation = false;
    }, { capture: true, passive: true, signal: outer.signal });
    viewport.addEventListener("focusin", (event) => {
      if (staticMode || !keyboardNavigation) return;
      const card = event.target.closest(".v4-program");
      if (!card) return;
      if (stepped) {
        // Tipkovnica: korak u kojem je fokusirana kartica cijela vidljiva.
        const index = [...track.children].indexOf(card);
        viewport.scrollLeft = 0;
        if (index < step) goToStep(index);
        else if (index >= step + visible) goToStep(index - visible + 1);
        return;
      }
      const offset = Math.min(Math.max(card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2, 0), maxOffset);
      viewport.scrollLeft = 0;
      window.scrollTo({ top: scrollY + section.getBoundingClientRect().top + offset - pinTop, behavior: "instant" });
      paint();
    }, { signal: outer.signal });
    // A compact desktop has a mouse, not a touchscreen: expose the same
    // horizontal rail to the ordinary wheel, releasing it at either end.
    viewport.addEventListener("wheel", (event) => {
      if (!staticMode || event.ctrlKey || event.shiftKey || event.defaultPrevented) return;
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) { stopWheel(); return; }
      const limit = viewport.scrollWidth - viewport.clientWidth;
      if (limit <= 1) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
      const delta = event.deltaY * unit;
      const currentTarget = wheelTarget ?? viewport.scrollLeft;
      const next = Math.max(0, Math.min(limit, currentTarget + delta));
      const stillMoving = Math.abs(currentTarget - viewport.scrollLeft) >= 1;
      // Release the page only after reaching the actual rail boundary.
      if (Math.abs(next - currentTarget) < 1 && !stillMoving) return;
      event.preventDefault();
      event.stopPropagation();
      if (motion.matches) { stopWheel(); viewport.scrollLeft = next; return; }
      wheelTarget = next;
      if (wheelFrame === undefined) wheelFrame = requestAnimationFrame(animateWheel);
    }, { passive: false, signal: outer.signal });
    if (stepped) {
      const inZone = () => {
        const start = zoneStart();
        return scrollY >= start - 1 && scrollY <= start + lastStep * stepScroll + 1;
      };
      // Jedan potez = jedan korak. Potez traje dok događaji stižu gušće od 140 ms
      // (inercija touchpada), pa se ostatak poteza nakon koraka zanemaruje.
      // Novi potez prepoznaje se i bez stanke, inače bi brzo vrtenje kotačića
      // zaglavilo u galeriji (svi zupci unutar 140 ms bili su "isti potez"):
      //  - zubac miša je uvijek svoj potez: wheelDelta u koracima od 120 (ili
      //    deltaMode u redcima) i ista jačina kao prethodni događaj, jer su zupci
      //    uvijek jednaki, a touchpad na Macu povremeno pogodi višekratnik 120;
      //  - promjena smjera je novi potez (inercija ne mijenja smjer);
      //  - na touchpadu porast delte nakon što je inercija počela slabjeti znači
      //    novi zamah (zamah raste pa pada; porast tijekom rasta nije novi);
      //  - potez bez stanke ipak ne traje dulje od 1,5 s, da se nikad ne zaglavi.
      let previousSize = 0;
      let previousSign = 0;
      let peakSize = 0;
      let gestureStart = 0;
      window.addEventListener("wheel", (event) => {
        if (staticMode || event.ctrlKey) return;
        const now = performance.now();
        const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        if (!delta) return;
        const size = Math.abs(delta);
        const sign = Math.sign(delta);
        const wheelDelta = Math.abs(event.wheelDeltaY || 0);
        const pause = now - lastWheel > 140;
        const steady = Math.abs(size - previousSize) <= Math.max(2, size * .1);
        // Zubac je uvijek barem ~30 px (Mac miš 40, Windows 100); sitni repovi inercije nisu zupci.
        const notch = event.deltaMode === 1 || (size >= 30 && wheelDelta >= 120 && wheelDelta % 120 === 0 && (pause || steady));
        const flick = previousSize < peakSize && size >= 1.5 * previousSize && size - previousSize >= 8;
        const fresh = pause || notch || flick || sign !== previousSign || now - gestureStart > 1500;
        lastWheel = now;
        if (fresh) { gestureStart = now; peakSize = size; } else peakSize = Math.max(peakSize, size);
        previousSize = size;
        previousSign = sign;
        if (!inZone()) { if (fresh) gesture = "pass"; return; }
        if (!fresh) {
          if (gesture === "pass") return;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        const next = step + (delta > 0 ? 1 : -1);
        // Na rubu galerije potez ide stranici: dalje dolje, odnosno natrag gore.
        if (next < 0 || next > lastStep) { gesture = "pass"; return; }
        gesture = "swallow";
        event.preventDefault();
        event.stopPropagation();
        goToStep(next);
      }, { capture: true, passive: false, signal: outer.signal });
      // Tipke za listanje stranice u galeriji također idu karticu po karticu.
      window.addEventListener("keydown", (event) => {
        if (staticMode || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("input, textarea, select, [contenteditable]")) return;
        const direction = ["ArrowDown", "PageDown", " "].includes(event.key) ? 1
          : ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
        if (!direction || (event.key === " " && target?.closest("a, button"))) return;
        if (!inZone()) return;
        const next = step + direction;
        if (next < 0 || next > lastStep) return;
        event.preventDefault();
        goToStep(next);
      }, { signal: outer.signal });
    }
    viewport.addEventListener("keydown", stopWheel, { signal: outer.signal });
    viewport.addEventListener("pointerdown", stopWheel, { passive: true, signal: outer.signal });
    viewport.addEventListener("touchstart", stopWheel, { passive: true, signal: outer.signal });
    window.addEventListener("scroll", paint, { passive: true, signal: outer.signal });
    compact.addEventListener("change", schedule, { signal: outer.signal });
    motion.addEventListener("change", schedule, { signal: outer.signal });
    window.addEventListener("resize", schedule, { passive: true, signal: outer.signal });
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    if (head) observer.observe(head);
    observer.observe(viewport);
    let disposed = false;
    document.fonts?.ready.then(() => { if (!disposed) schedule(); });
    apply();
    return () => {
      disposed = true;
      stopWheel();
      outer.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      section.style.height = "";
      section.style.removeProperty("--rail-fit");
      section.style.removeProperty("--rail-card-w");
      section.style.removeProperty("--rail-peek");
      section.classList.remove("v4-programi--stepped", "is-rail-end", "is-rail-active");
      [...track.children].forEach(card => card.classList.remove("is-offstage"));
      track.style.transform = "";
      if (progressRef.current) progressRef.current.style.width = "";
    };
  }, [pinRef, trackRef, progressRef, stepped]);
}
