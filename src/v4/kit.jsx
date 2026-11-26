import { Fragment, useEffect, useRef } from "react";
import { waveGeometry, waveEdgeAtX, programWaveGeometry, editorialWaveGeometry } from "./wave.js";
import { SCROLL_JUMP } from "../smoothScroll.js";

/* ============================================================
   V4 KIT — dijeljene primitive "Utočište" design-sistema.
   Koristi ih svaka stranica u v4 jeziku (V4Page, ONamaPage, …):
   - <V4Shell>  wrapper .v4 + bg-morph + wave (krug) skaliranje
   - <SplitText> rečenica koja se ispisuje slovo po slovo (Méline)
   - <Curve>    sekcija čiji divovski krug "konzumira" prethodnu
   Boje/tipografija dolaze iz globalnih tokena (tokens.css, --ps-*).
   ============================================================ */

export const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* SplitText — velika rečenica koja se ISPISUJE slovo po slovo (Mélinin
   GSAP SplitText: svako slovo krene s opacity 0 + translate(2rem, 1rem)
   i sjedne na mjesto, brzi per-letter stagger). Riječi ostaju cjelovite
   (nowrap) pa se lom događa samo između riječi. Odigra JEDNOM na ulazak
   u viewport (bez reverse-a → bez štekanja). `segments` = [{ text }, …].
   - as:      element (h1/h2/p …)
   - variant: "" = dizanje (kao paragraf) · "wipe" = fade lijevo→desno
   - delay:   početni pomak (s) za kaskadu više elemenata */
export function SplitText({
  segments,
  className = "",
  as: Tag = "p",
  variant = "",
  delay = 0,
  active,
  onComplete,
  stagger = 0.008,
  duration,
}) {
  const ref = useRef(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active === false) return;
    if (reduceMotion()) {
      el.classList.add("is-in");
      completeRef.current?.();
      return;
    }
    let timer = null;
    const glideController = new AbortController();
    // Dodaj is-in ODMAH (bez rAF — throttlan tab ne bi okinuo rAF pa
    // bi tekst ostao nevidljiv). Za elemente odmah u vidokrugu mali
    // transition-delay (>=0.1s) spriječi da se transition preskoči.
    // will-change samo dok animira, pa počisti (bez trajnih slojeva).
    const enter = () => {
      if (el.classList.contains("is-in")) return;
      el.classList.add("is-in", "is-animating");
      glideController.abort();
      const n = el.querySelectorAll(".v4-letter").length;
      timer = setTimeout(
        () => { el.classList.remove("is-animating"); completeRef.current?.(); },
        Math.max(0, n - 1) * stagger * 1000 + (duration ?? 0.45) * 1000 + delay * 1000,
      );
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        enter();
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    if (active === true) enter();
    else {
      io.observe(el);
      // Cinematic scroll (useSnapScroll): skok na stanicu najavi odredište, pa naslov
      // koji će ondje biti vidljiv ulazi odmah, tijekom skoka, a ne tek po dolasku.
      window.addEventListener("pg:snap-glide", (event) => {
        const top = el.getBoundingClientRect().top + scrollY;
        const { target } = event.detail;
        if (top >= target - 40 && top < target + innerHeight) { io.disconnect(); enter(); }
      }, { signal: glideController.signal });
    }
    return () => {
      io.disconnect();
      glideController.abort();
      if (timer) clearTimeout(timer);
    };
  }, [delay, active, stagger, duration]);

  let li = 0; // globalni brojač slova → sekvencijalni delay (kao Méline)
  const cls = ["v4-split", variant && `v4-split--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag ref={ref} className={cls}>
      <span className="v4-sr-only">{segments.map((seg) => seg.text.trim()).join(" ")}</span>
      <span aria-hidden="true">
      {segments.map((seg, si) => {
        const words = seg.text
          .trim()
          .split(/\s+/)
          .map((word, wi) => (
            <Fragment key={`${si}-${wi}`}>
              <span className="v4-word">
                {[...word].map((ch, ci) => (
                  <span
                    key={ci}
                    className={`v4-letter${seg.em ? " v4-letter-em" : ""}`}
                    style={{
                      transitionDelay: `${(delay + li++ * stagger).toFixed(3)}s`,
                      ...(duration != null ? { transitionDuration: `${duration}s` } : {}),
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>{" "}
            </Fragment>
          ));
        // `br` = dio uvijek počinje u novom redu (ručni prijelom)
        if (seg.br) return <Fragment key={si}><br />{words}</Fragment>;
        // `soft` = vlastiti redak u mekšoj boji (drugi red naslova)
        return seg.soft ? (
          <span className="v4-split__soft" key={si}>
            {words}
          </span>
        ) : (
          <Fragment key={si}>{words}</Fragment>
        );
      })}
      </span>
    </Tag>
  );
}

/* Curve — animated section surface. Public pages flatten the curved edge
   completely; the legacy layout retains its scaling circle. Boja = data-bg.
   `noMorph` → sekcija ne sudjeluje u bg-morphu (nema data-bg): boju daje
   ISKLJUČIVO njen krug, pa wrapper (a time i sekcije iznad, koje nemaju
   vlastitu pozadinu) zadržava prethodnu boju. */
export function Curve({
  color,
  className = "",
  children,
  innerRef,
  noMorph = false,
  consumeStart, // <1 → gutanje kreće kasnije (vrh sekcije mora doći više)
  ...rest
}) {
  return (
    <section
      ref={innerRef}
      className={`v4-curve ${className}`}
      {...(noMorph ? {} : { "data-bg": color })}
      style={{ "--curve": color }}
      {...rest}
    >
      <div
        className="v4-circle"
        data-circle
        {...(consumeStart != null
          ? { "data-consume-start": consumeStart }
          : {})}
        aria-hidden="true"
      />
      {children}
    </section>
  );
}

/* Cursor-depth parallax: elementi s [data-depth] unutar `ref` mekano prate
   kursor (lerp 0.05). Piše --cx/--cy (NE transform) da se može komponirati
   s drugim transformima na istom elementu (bob, bočni ulaz…). */
export function useCursorDepth(ref) {
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (reduceMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const items = [...host.querySelectorAll("[data-depth]")];
    if (!items.length) return;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const depths = items.map((el) => parseFloat(el.dataset.depth));
    let raf = null;

    /* Petlja se GASI kad se pozicija smiri — prije je rAF radio zauvijek
       (i kad miš stoji i kad je sekcija izvan ekrana) i trošio frameove. */
    const loop = () => {
      raf = null;
      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      cur.x += dx * 0.05;
      cur.y += dy * 0.05;
      items.forEach((el, i) => {
        el.style.setProperty("--cx", `${(cur.x * depths[i]).toFixed(1)}px`);
        el.style.setProperty("--cy", `${(cur.y * depths[i]).toFixed(1)}px`);
      });
      if (Math.abs(dx) > 0.0004 || Math.abs(dy) > 0.0004) {
        raf = requestAnimationFrame(loop);
      }
    };
    const kick = () => {
      if (raf == null) raf = requestAnimationFrame(loop);
    };

    const ctrl = new AbortController();
    host.addEventListener(
      "mousemove",
      (e) => {
        const r = host.getBoundingClientRect();
        target.x = (e.clientX - r.left) / r.width - 0.5;
        target.y = (e.clientY - r.top) / r.height - 0.5;
        kick();
      },
      { passive: true, signal: ctrl.signal },
    );
    host.addEventListener(
      "mouseleave",
      () => {
        target.x = 0;
        target.y = 0;
        kick();
      },
      { signal: ctrl.signal },
    );
    return () => {
      ctrl.abort();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/* One rAF-throttled handler updates surfaces and navigation tint together.
   Public pages use waveGeometry to flatten their elliptical surface edges;
   their base color stays fixed. Legacy layouts retain the circle geometry
   and background morph. Both paths calculate the visible edge analytically. */
export function useV4Transitions(wrapRef) {
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const root = document.documentElement;
    // Boja navigacije piše se na samu traku, ne na <html>: naslijeđeno custom svojstvo
    // na korijenu pri svakoj promjeni invalidira stil cijelog dokumenta (~30 ms).
    const navHost = document.querySelector(".nav") || root;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const editorial = wrap.hasAttribute("data-editorial-waves");
    const readingLayout = wrap.classList.contains("marketing-page");
    document.body.classList.add("v4-nav");

    // ---- keširano jednom (ne po frameu) ----
    const morphSections = [...wrap.querySelectorAll("[data-bg]")];
    const normalizeSurface = (color) => color.trim().toLowerCase();
    const circles = [...wrap.querySelectorAll(".v4-circle")].map((el) => {
      const section = el.parentElement;
      const curve = section.style.getPropertyValue("--curve").trim();
      const sectionIndex = morphSections.indexOf(section);
      const previousColor = sectionIndex > 0 ? morphSections[sectionIndex - 1].dataset.bg : "";
      const continuous = readingLayout && normalizeSurface(previousColor || "") === normalizeSurface(curve);
      if (readingLayout) section.dataset.surfaceTransition = continuous ? "continuous" : "arc";
      const previous = section.previousElementSibling;
      let readingEdge = null;
      if (!editorial && previous?.matches(".v4-online")) readingEdge = previous.querySelector(".v4-btn");
      // Ivana → Teme: val staje ispod gumba "Pričajmo", pa ostaje zakrivljen i ne prekriva gumb.
      else if (!editorial && previous?.matches(".v4-ivana")) readingEdge = previous.querySelector(".v4-ivana__cta");
      else if (!editorial && previous?.matches(".v4-programi")) readingEdge = previous.querySelector(".v4-programi__viewport");
      else if (!editorial && previous?.matches(".v4-iskustva")) readingEdge = previous.querySelector(".v4-step:last-child .v4-stackcard");
      return {
        previous, readingEdge,
        readingBlocks: editorial && previous ? previous.querySelectorAll("[data-wave-content]") : [],
        el,
        section,
        // Pomaci sadržaja pišu se na sekciju i na elemente koji ih troše, a ne samo na
        // sekciju: svojstva su bez nasljeđivanja (@property u premium.css), pa zapis ne
        // invalidira stil svih potomaka sekcije u svakom kadru.
        liftTargets: [section, ...section.querySelectorAll(".pg-online-text-only, .pg-stats-content")],
        ctaLiftTargets: [section, ...[...section.children].filter(child => child !== el)],
        // Traka napretka galerije troši --rail-indicator-opacity; zapis na nju, ne na sekciju.
        previousIndicator: previous?.querySelector(".v4-programi__progress") || null,
        animated: el.hasAttribute("data-circle"),
        start: readingLayout ? 0.95 : parseFloat(el.dataset.consumeStart || "1"),
        curve,
        continuous,
      };
    });
    let navH = 64;
    const measureNav = () => {
      const nav = document.querySelector(".nav");
      if (nav) navH = nav.offsetHeight; // forced layout — samo na resize
    };
    measureNav();

    let lastBg = "";
    let lastNav = "";

    const update = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const still = motion.matches;
      const W = vw * 6; // 600vw
      /* TRENUTNA (interpolirana) boja wrappera — čita se PRIJE ijednog
         pisanja u ovom prolazu, da se ne izazove style flush usred petlje.
         Treba nam jer wrapper boju mijenja mekim 1.1s morphom: kad ispod
         navigacije nema luka, vidi se upravo ta međuboja. */
      const wrapNow = getComputedStyle(wrap).backgroundColor;
      const rects = new Map(); // sekcija → rect (svaka čitana najviše jednom)
      const rectOf = (el) => {
        let r = rects.get(el);
        if (!r) rects.set(el, (r = el.getBoundingClientRect()));
        return r;
      };

      // Read the stable content wrappers before writing any surface styles.
      // Their bounds include live changes inside accordions and the program rail.
      if (editorial) {
        rectOf(wrap);
        for (const circle of circles) {
          rectOf(circle.section);
          if (!still && !circle.continuous) circle.readingBlocks.forEach(rectOf);
        }
      }

      // Public surfaces carry their own color all the way to the wrapper's
      // bottom. Keep the base fixed: switching it at mid-screen would fill
      // the still-curved corners abruptly before the edge has flattened.
      const mid = vh * 0.5;
      let bg = morphSections.length ? morphSections[0].dataset.bg : "";
      for (const s of readingLayout ? [] : morphSections) {
        const r = rectOf(s);
        if (r.top <= mid && r.bottom > mid) {
          bg = s.dataset.bg;
          break;
        }
      }
      if (bg !== lastBg) {
        wrap.style.backgroundColor = bg;
        lastBg = bg;
      }

      const wrapBottom = readingLayout ? rectOf(wrap).bottom : 0;
      const navY = navH / 2;
      const navX = vw / 2;
      let navColor = null;
      for (const c of circles) {
        const r = rectOf(c.section);
        if (readingLayout) {
          const { previous, readingEdge } = c;
          let shape;
          if (c.continuous || still) {
            shape = { lift: 0, depth: 0 };
          } else if (editorial) {
            // The lowest paragraph, open accordion or action sets the reading edge.
            let bottom = -Infinity;
            for (const block of c.readingBlocks) {
              const box = rectOf(block);
              if (box.height > 0) bottom = Math.max(bottom, box.bottom);
            }
            const gap = Math.max(24, Math.min(48, vh * .045));
            const clearance = r.top - bottom - gap + Math.max(0, -bottom);
            shape = editorialWaveGeometry(r.top, r.width, vh, clearance, still);
          } else if (c.section.classList.contains("pg-original-programs")) {
            shape = programWaveGeometry(r.top, r.width, vh, still);
          } else {
            shape = waveGeometry(r.top, r.width, vh, c.start, still);
          }
          // Homepage scenes have special exits for the pinned gallery and reviews.
          if (readingEdge && !c.continuous) {
            const safeGap = Math.max(24, Math.min(48, vh * .045));
            const bottom = rectOf(readingEdge).bottom;
            let available = Math.max(0, r.top - bottom - safeGap);
            // Izlaz iz galerije programa vrijedi za bilo koju sekciju koja slijedi (redoslijed se mijenjao).
            const galleryExit = previous.matches(".v4-programi");
            const reviewExit = c.section.matches(".pg-home-closing") && previous.matches(".v4-iskustva");
            if (!still && (galleryExit || reviewExit)) {
              // Release the surface once the last card is leaving the reading area.
              const exit = Math.max(0, Math.min(1, (.48 * vh - bottom) / (.4 * vh)));
              const easedExit = exit * exit * (3 - 2 * exit);
              available += vh * .32 * easedExit;
              if (galleryExit) (c.previousIndicator || previous).style.setProperty("--rail-indicator-opacity", 1 - easedExit);
              // Use the visible crest, including the reading clearance, to finish the arc.
              const crest = r.top - Math.min(shape.lift, available);
              const remaining = Math.max(0, Math.min(1, (crest + .12 * vh) / (.65 * vh)));
              shape.depth = Math.max(shape.depth, Math.min(vh * .15, r.width * .09) * remaining);
            }
            shape.lift = Math.min(shape.lift, available);
            // Ivana → Teme: luk zadržava zakrivljenost dok se ne približi vrhu, umjesto ravne crte.
            if (!still && c.section.matches(".v4-podrucja") && previous.matches(".v4-ivana")) {
              const crest = r.top - shape.lift;
              const remaining = Math.max(0, Math.min(1, (crest + .12 * vh) / (.65 * vh)));
              shape.depth = Math.max(shape.depth, Math.min(vh * .15, r.width * .09) * remaining);
            }
          }
          if (c.section.hasAttribute("data-center-wave")) {
            // Keep the invitation centred in the visible surface as its top lifts.
            // Vidljivi dio površine počinje na vrhu ekrana kad se val podigne iznad njega:
            // podizanje se računa samo do vrha sekcije (r.top), inače bi na dnu stranice
            // naslov otišao iznad ekrana i ostao bi vidljiv samo gumb.
            // Sekcija sama zadržava puni iznos (margin-bottom, preklapanje s podnožjem),
            // da se visina stranice ne mijenja dok se scrolla; samo sadržaj dobiva ograničeni.
            const ctaLift = `${(Math.max(0, Math.min(shape.lift, r.top)) / 2).toFixed(3)}px`;
            const ctaMargin = `${(shape.lift / 2).toFixed(3)}px`;
            for (const target of c.ctaLiftTargets) target.style.setProperty("--cta-content-lift", target === c.section ? ctaMargin : ctaLift);
          }
          if (c.section.hasAttribute("data-ride-wave")) {
            // Let the surface reach the top first; then lift the content gently.
            const progress = Math.max(0, Math.min(1, (vh * .52 - r.top) / (vh * .37)));
            const eased = progress * progress * (3 - 2 * progress);
            const requestedLift = still || c.continuous ? 0 : Math.min(vh * .18, 200) * eased;
            const paddingTop = parseFloat(getComputedStyle(c.section).paddingTop) || 0;
            const safeLift = readingEdge ? Math.max(0, r.top + paddingTop - rectOf(readingEdge).bottom - Math.max(24, Math.min(48, vh * .045))) : requestedLift;
            const surfaceInset = Math.max(32, Math.min(48, vh * .045));
            const insideSurface = Math.max(0, shape.lift + paddingTop - surfaceInset);
            const contentLift = Math.min(requestedLift, safeLift, insideSurface);
            const lift = contentLift.toFixed(3) + "px";
            for (const target of c.liftTargets) target.style.setProperty("--content-lift", lift);
          }
          c.el.style.setProperty("--wave-lift", `${shape.lift.toFixed(3)}px`);
          c.el.style.setProperty("--wave-depth", `${shape.depth.toFixed(3)}px`);
          // Površina seže ispod sekcije samo jedan ekran: toliko treba da se ispod
          // zaobljenih kutova sljedećeg vala vidi ova boja. Do dna omotača bi svaka
          // sekcija bila GPU sloj visok kao cijela stranica (stotine MB, zastoji).
          c.el.style.setProperty("--wave-height", `${Math.min(Math.max(r.height, wrapBottom - r.top), r.height + vh).toFixed(3)}px`);
          if (navY >= waveEdgeAtX(r.top, r.left, r.width, navX, shape) && navY <= wrapBottom) {
            navColor = c.curve;
          }
          continue;
        }
        let s = 1;
        if (c.animated && !still) {
          const p = Math.min(Math.max((vh * c.start - r.top) / (vh * 0.7), 0), 1);
          s = 1 + 0.14 * p;
          c.el.style.transform = `translateX(-50%) scale(${s.toFixed(4)})`;
        }
        // pokriva li krug točku ispod navigacije? (kasniji prekriva ranije)
        if (c.curve) {
          const rad = (W * s) / 2;
          const dx = navX - (r.left + r.width / 2);
          const dy = navY - (r.top + W / 2);
          if (dx * dx + dy * dy <= rad * rad) navColor = c.curve;
        }
      }

      /* Nijedan luk ne pokriva točku ispod navigacije → ondje se vidi sam
         wrapper, pa uzimamo njegovu trenutnu međuboju (ne ciljanu `bg`).
         Inače bi nav skočio na novu boju prije nego je podloga stigne. */
      if (navColor === null) navColor = wrapNow;

      // 3) nav tint
      if (navColor !== lastNav) {
        navHost.style.setProperty("--nav-bg", navColor);
        navHost.style.setProperty(
          "--nav-fg",
          isDark(navColor) ? "#faf6f0" : "#5c3d29",
        );
        lastNav = navColor;
      }
      wrap.dispatchEvent(new Event("pg:surface-updated"));
    };

    // rAF throttle: najviše jedan prolaz po frameu bez obzira na broj eventa
    let frame = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };

    const ctrl = new AbortController();
    window.addEventListener("scroll", onScroll, {
      passive: true,
      signal: ctrl.signal,
    });
    // Programski pomak (jumpTo): valove iscrtaj odmah, bez kadra kašnjenja.
    window.addEventListener(SCROLL_JUMP, update, { signal: ctrl.signal });
    window.addEventListener(
      "resize",
      () => {
        measureNav();
        onScroll();
      },
      { passive: true, signal: ctrl.signal },
    );
    motion.addEventListener("change", onScroll, { signal: ctrl.signal });
    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(wrap);
    update();
    return () => {
      ctrl.abort();
      resizeObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      document.body.classList.remove("v4-nav");
      wrap.style.backgroundColor = "";
      navHost.style.removeProperty("--nav-bg");
      navHost.style.removeProperty("--nav-fg");
    };
  }, [wrapRef]);
}

/* Polje oblika (hero): svaki oblik ima VLASTITI smjer, amplitudu i brzinu
   smirivanja + težinu po blizini kursora. Za razliku od useCursorDepth
   (jedan zajednički vektor × ±depth → efektivno samo dva smjera i vidljiva
   granica između "skupina"), ovdje su smjerovi raspoređeni zlatnim rezom
   po punom krugu pa nema grupiranja — oblici bliži kursoru reagiraju jače,
   što stvara pomični fokus umjesto jedne globalne osi. */
export function useBlobField(hostRef, svgSelector = ".v4-shapes") {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (reduceMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const svg = host.querySelector(svgSelector);
    if (!svg) return;
    const vb = svg.viewBox.baseVal;

    const PHI = 0.6180339887;
    const frac = (n) => n - Math.floor(n);
    const blobs = [...svg.querySelectorAll(".v4-blob")].map((el, i) => {
      const b = el.querySelector("path").getBBox(); // bazna pozicija (user units)
      const angle = frac(i * PHI) * Math.PI * 2; // ravnomjerno po krugu
      const amp = 70 + frac(i * 0.37 + 0.11) * 95; // 70–165
      return {
        el,
        cx: b.x + b.width / 2,
        cy: b.y + b.height / 2,
        ax: Math.cos(angle) * amp,
        ay: Math.sin(angle) * amp,
        ease: 0.04 + frac(i * 0.29 + 0.5) * 0.055, // svaki se smiruje svojim tempom
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
      };
    });
    if (!blobs.length) return;

    const R = Math.max(vb.width, vb.height) * 0.38; // domet "fokusa"
    let raf = null;

    const loop = () => {
      raf = null;
      let moving = false;
      for (const b of blobs) {
        const dx = b.tx - b.x;
        const dy = b.ty - b.y;
        b.x += dx * b.ease;
        b.y += dy * b.ease;
        b.el.style.setProperty("--cx", `${b.x.toFixed(1)}px`);
        b.el.style.setProperty("--cy", `${b.y.toFixed(1)}px`);
        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) moving = true;
      }
      if (moving) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (raf == null) raf = requestAnimationFrame(loop);
    };

    const aim = (clientX, clientY) => {
      const r = svg.getBoundingClientRect();
      // kursor u koordinatama viewBoxa
      const pu = ((clientX - r.left) / r.width) * vb.width;
      const pv = ((clientY - r.top) / r.height) * vb.height;
      // globalni odmak od središta (−0.5…0.5)
      const gx = (clientX - r.left) / r.width - 0.5;
      const gy = (clientY - r.top) / r.height - 0.5;
      for (const b of blobs) {
        const d = Math.hypot(pu - b.cx, pv - b.cy);
        const w = 1 / (1 + (d / R) * (d / R)); // blizu = 1, daleko → 0
        const k = 0.3 + 1.5 * w; // uvijek malo, kod kursora puno
        b.tx = gx * b.ax * k;
        b.ty = gy * b.ay * k;
      }
      kick();
    };

    const ctrl = new AbortController();
    host.addEventListener(
      "mouseenter",
      () => svg.classList.add("is-hovered"), // disanje pojača
      { signal: ctrl.signal },
    );
    host.addEventListener("mousemove", (e) => aim(e.clientX, e.clientY), {
      passive: true,
      signal: ctrl.signal,
    });
    host.addEventListener(
      "mouseleave",
      () => {
        svg.classList.remove("is-hovered");
        for (const b of blobs) {
          b.tx = 0;
          b.ty = 0;
        }
        kick();
      },
      { signal: ctrl.signal },
    );
    return () => {
      ctrl.abort();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [hostRef, svgSelector]);
}

/* Pauzira CSS animacije unutar `ref` dok je sekcija izvan ekrana
   (disanje oblika, bob oblačića) — nema smisla trošiti frameove na
   nešto što se ne vidi. */
export function usePauseOffscreen(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("is-offscreen", !e.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("is-offscreen");
    };
  }, [ref]);
}

/* Je li boja tamna? (relativna luminancija; podržava #rgb/#rrggbb i rgb()) */
function isDark(color) {
  let r, g, b;
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    const full =
      h.length === 3
        ? h
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : h;
    r = parseInt(full.slice(0, 2), 16);
    g = parseInt(full.slice(2, 4), 16);
    b = parseInt(full.slice(4, 6), 16);
  } else {
    const m = color.match(/(\d+(?:\.\d+)?)/g);
    if (!m || m.length < 3) return false;
    [r, g, b] = m.map(Number);
  }
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.55;
}

/* V4Shell — .v4 wrapper koji nosi bg-morph + wave tranzicije. Sadržaj
   su sekcije (Curve i/ili [data-bg]) u v4 jeziku. */
export function V4Shell({ children, className = "", ...attributes }) {
  const wrapRef = useRef(null);
  useV4Transitions(wrapRef);
  const cls = ["v4", className].filter(Boolean).join(" ");
  return (
    <div className={cls} ref={wrapRef} {...attributes}>
      {children}
    </div>
  );
}
