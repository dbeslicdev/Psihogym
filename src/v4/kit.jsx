import { Fragment, useEffect, useRef } from "react";

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
}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion()) {
      el.classList.add("is-in");
      return;
    }
    let timer = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        // Dodaj is-in ODMAH (bez rAF — throttlan tab ne bi okinuo rAF pa
        // bi tekst ostao nevidljiv). Za elemente odmah u vidokrugu mali
        // transition-delay (>=0.1s) spriječi da se transition preskoči.
        // will-change samo dok animira, pa počisti (bez trajnih slojeva).
        el.classList.add("is-in", "is-animating");
        io.disconnect();
        const n = el.querySelectorAll(".v4-letter").length;
        timer = setTimeout(
          () => el.classList.remove("is-animating"),
          n * 8 + 450 + delay * 1000,
        );
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  let li = 0; // globalni brojač slova → sekvencijalni delay (kao Méline)
  const cls = ["v4-split", variant && `v4-split--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag ref={ref} className={cls}>
      {segments.map((seg, si) =>
        seg.text
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
                      transitionDelay: `${(delay + li++ * 0.008).toFixed(3)}s`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>{" "}
            </Fragment>
          )),
      )}
    </Tag>
  );
}

/* Curve — sekcija čija je pozadina divovski krug (Mélinin mehanizam):
   scroll skalira krug pa se njegov gornji luk penje brže od scrolla i
   "konzumira" prethodnu sekciju, postajući sve ravniji. Boja = data-bg.
   `staticArc` → krug se NE skalira (nema data-circle): gornji rub je i
   dalje valovit, ali putuje sa scrollom i NE obuzima prethodnu sekciju.
   `noMorph` → sekcija ne sudjeluje u bg-morphu (nema data-bg): boju daje
   ISKLJUČIVO njen krug, pa wrapper (a time i sekcije iznad, koje nemaju
   vlastitu pozadinu) zadržava prethodnu boju. */
export function Curve({
  color,
  className = "",
  children,
  innerRef,
  staticArc = false,
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
        {...(staticArc ? {} : { "data-circle": true })}
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

/* Page-level tranzicije na .v4 wrapperu — SVE u JEDNOM rAF-throttlanom
   scroll handleru (bg-morph + skaliranje krugova + nav tint). Prije su bila
   tri odvojena listenera koja su na svaki scroll event radila sinkrona
   layout-čitanja; uz Lenis (scroll svaki frame) to je trzalo.

   Geometrija krugova računa se ANALITIČKI (ne getBoundingClientRect nakon
   pisanja transforma → nema layout thrasha): krug je top:0, left:50%,
   width 600vw, transform translateX(-50%) scale(s), pa mu je
   centar = (sredina sekcije X, vrh sekcije + W/2), radijus = W*s/2. */
export function useV4Transitions(wrapRef) {
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const root = document.documentElement;
    const still = reduceMotion();
    document.body.classList.add("v4-nav");

    // ---- keširano jednom (ne po frameu) ----
    const morphSections = [...wrap.querySelectorAll("[data-bg]")];
    const circles = [...wrap.querySelectorAll(".v4-circle")].map((el) => ({
      el,
      section: el.parentElement,
      animated: el.hasAttribute("data-circle"),
      start: parseFloat(el.dataset.consumeStart || "1"),
      curve: el.parentElement.style.getPropertyValue("--curve").trim(),
    }));
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
      const W = vw * 6; // 600vw
      const rects = new Map(); // sekcija → rect (svaka čitana najviše jednom)
      const rectOf = (el) => {
        let r = rects.get(el);
        if (!r) rects.set(el, (r = el.getBoundingClientRect()));
        return r;
      };

      // 1) bg-morph — boju drži sekcija koja pokriva sredinu ekrana
      const mid = vh * 0.5;
      let bg = morphSections.length ? morphSections[0].dataset.bg : "";
      for (const s of morphSections) {
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

      // 2) krugovi: skaliranje 1 → 1.14 + analitička geometrija za nav
      const navY = navH / 2;
      const navX = vw / 2;
      let navColor = bg;
      for (const c of circles) {
        const r = rectOf(c.section);
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

      // 3) nav tint
      if (navColor !== lastNav) {
        root.style.setProperty("--nav-bg", navColor);
        root.style.setProperty(
          "--nav-fg",
          isDark(navColor) ? "#faf6f0" : "#5c3d29",
        );
        lastNav = navColor;
      }
    };

    // rAF throttle: najviše jedan prolaz po frameu bez obzira na broj eventa
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    const ctrl = new AbortController();
    window.addEventListener("scroll", onScroll, {
      passive: true,
      signal: ctrl.signal,
    });
    window.addEventListener(
      "resize",
      () => {
        measureNav();
        onScroll();
      },
      { passive: true, signal: ctrl.signal },
    );
    update();
    return () => {
      ctrl.abort();
      document.body.classList.remove("v4-nav");
      wrap.style.backgroundColor = "";
      root.style.removeProperty("--nav-bg");
      root.style.removeProperty("--nav-fg");
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
    host.addEventListener("mousemove", (e) => aim(e.clientX, e.clientY), {
      passive: true,
      signal: ctrl.signal,
    });
    host.addEventListener(
      "mouseleave",
      () => {
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
export function V4Shell({ children, className = "" }) {
  const wrapRef = useRef(null);
  useV4Transitions(wrapRef);
  const cls = ["v4", className].filter(Boolean).join(" ");
  return (
    <div className={cls} ref={wrapRef}>
      {children}
    </div>
  );
}
