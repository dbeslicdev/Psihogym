import { useEffect, useRef } from "react";
import { programWaveGeometry } from "./wave.js";

// Every dot and the live stroke endpoint use the very same SVG path length.
export default function ScrollThread() {
  const svgRef = useRef(null);
  const baseRef = useRef(null);
  const liveRef = useRef(null);
  const dotsRef = useRef(null);
  const tipRef = useRef(null);
  const haloRef = useRef(null);
  const maskBackgroundRef = useRef(null);
  const galleryMaskRef = useRef(null);
  const baseMaskBackgroundRef = useRef(null);
  const baseGalleryMaskRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const content = svg?.parentElement;
    if (!content) return;
    const live = liveRef.current;
    const base = baseRef.current;
    const tip = tipRef.current;
    const halo = haloRef.current;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    let points = [];
    let segments = [];
    let pathLength = 0;
    let endY = 0;
    let frame;
    let rebuildTimer;
    let stops = [];
    let focusOffset = 0;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const origin = () => content.getBoundingClientRect().top + scrollY;
    const centreOf = (elements, fallback) => {
      const boxes = elements.filter(Boolean).map(el => el.getBoundingClientRect()).filter(r => r.height > 0);
      if (!boxes.length) return fallback.getBoundingClientRect().top + fallback.offsetHeight / 2;
      return (Math.min(...boxes.map(r => r.top)) + Math.max(...boxes.map(r => r.bottom))) / 2;
    };
    const anchorViewportY = (section) => {
      if (section.matches(".v4-hero")) return centreOf([section.querySelector(".v4-hero__text"), section.querySelector(".pg-hero-scene")], section);
      if (section.matches(".v4-emphasis")) return centreOf([section.querySelector(".v4-split")], section);
      if (section.matches(".v4-ivana")) {
        const intro = section.previousElementSibling?.matches(".v4-emphasis--intro")
          ? section.previousElementSibling.querySelector(".v4-split") : null;
        return centreOf([intro, section.querySelector(".v4-ivana__media"), section.querySelector(".v4-ivana__tx")], section);
      }
      if (section.matches(".pg-topics-scroll")) return centreOf([...section.querySelectorAll(".v4-chip")], section);
      if (section.matches(".v4-online")) return centreOf([section.querySelector(".pg-online-text-only")], section);
      if (section.matches(".v4-stats")) return centreOf([section.querySelector(".pg-stats-content")], section);
      if (section.matches(".v4-iskustva")) {
        // One permanent stop for the whole reviews section. Sticky/transformed
        // cards must not relocate it or make a previously absent dot appear lit.
        return section.getBoundingClientRect().top + section.offsetHeight / 2;
      }
      if (section.matches(".v4-cta")) return centreOf([section.querySelector(".v4-cta__title"), section.querySelector(".v4-btn")], section);
      return centreOf([...section.children].filter(el => !el.matches(".v4-circle")), section);
    };
    const pointAtY = (y) => {
      y = clamp(y, 0, endY);
      let low = 0;
      let high = points.length - 1;
      while (high - low > 1) {
        const middle = (low + high) >> 1;
        if (points[middle].y <= y) low = middle;
        else high = middle;
      }
      const a = points[low];
      const b = points[high];
      const t = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y);
      return { x: a.x + (b.x - a.x) * t, y, index: low };
    };
    const putCircle = (circle, point) => {
      circle.setAttribute("cx", point.x.toFixed(3));
      circle.setAttribute("cy", point.y.toFixed(3));
    };
    const tick = () => {
      if (controller.signal.aborted || !svg.isConnected || motion.matches || !pathLength) return;
      const contentOrigin = origin();
      const anchorYs = stops.map(({ section }) => clamp(anchorViewportY(section) + scrollY - contentOrigin, 0, endY));
      if (scrollY < 1 && stops.length) {
        focusOffset = anchorYs[0] + contentOrigin;
      }
      const focus = clamp(scrollY - contentOrigin + focusOffset, 0, endY);
      const point = pointAtY(focus);
      // Draw only the visible prefix, ending at the exact circle coordinate.
      live.setAttribute("d", segments.slice(0, point.index + 1).join(" ") + ` L${point.x.toFixed(3)},${point.y.toFixed(3)}`);
      putCircle(tip, point);
      putCircle(halo, point);
      stops.forEach(({ circle }, index) => {
        const y = anchorYs[index];
        putCircle(circle, pointAtY(y));
        circle.style.display = "";
        circle.classList.toggle("lit", y <= focus);
      });
      const gallery = content.querySelector(".v4-programi__sticky");
      if (gallery) {
        const section = gallery.closest(".v4-programi");
        const box = section.getBoundingClientRect();
        // Use the same geometry as the moving surface, not the section box:
        // the cyan wave can reach above the section's nominal top.
        const continuous = section.dataset.surfaceTransition === "continuous";
        const shape = continuous ? { lift: 0, depth: 0 }
          : programWaveGeometry(box.top, box.width, innerHeight, motion.matches);
        const surface = section.querySelector(".v4-circle");
        if (surface && !continuous) {
          const paintedLift = parseFloat(surface.style.getPropertyValue("--wave-lift"));
          const paintedDepth = parseFloat(surface.style.getPropertyValue("--wave-depth"));
          if (Number.isFinite(paintedLift)) shape.lift = paintedLift;
          if (Number.isFinite(paintedDepth)) shape.depth = paintedDepth;
        }
        const top = box.top + scrollY - contentOrigin - shape.lift - 2;
        const bottom = box.bottom + scrollY - contentOrigin;
        const left = box.left;
        const right = box.right;
        const middle = left + box.width / 2;
        const depth = shape.depth;
        const edge = `M${left},${top + depth} A${box.width / 2},${depth} 0 0 1 ${middle},${top} A${box.width / 2},${depth} 0 0 1 ${right},${top + depth} L${right},${bottom} L${left},${bottom} Z`;
        for (const mask of [galleryMaskRef.current, baseGalleryMaskRef.current]) {
          mask.setAttribute("d", edge);
        }
      } else {
        galleryMaskRef.current.setAttribute("d", "");
        baseGalleryMaskRef.current.setAttribute("d", "");
      }
    };
    const schedule = () => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        tick();
      });
    };
    const build = () => {
      if (controller.signal.aborted || !svg.isConnected) return;
      svg.style.display = motion.matches ? "none" : "";
      if (motion.matches) return;
      const footer = content.querySelector(".footer");
      // The reading trail ends before the footer, including its empty stroke.
      const height = Math.ceil(footer
        ? footer.getBoundingClientRect().top + scrollY - origin()
        : content.offsetHeight);
      const width = innerWidth;
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.style.width = width + "px";
      svg.style.height = height + "px";
      endY = Math.max(1, height - 24);
      const narrow = width < 700;
      const baseX = narrow ? 9 : Math.round(clamp(width * .034, 26, 58));
      const bow = narrow ? 3 : Math.min(20, width * .013);
      const period = Math.max(560, innerHeight * .95);
      points = [];
      let distance = 0;
      const addPoint = (y) => {
        const x = Number((baseX + Math.sin(y / period * Math.PI * 2) * bow).toFixed(2));
        const previous = points.at(-1);
        if (previous) distance += Math.hypot(x - previous.x, y - previous.y);
        points.push({ x, y, length: distance });
      };
      for (let y = 0; y < endY; y += 7) addPoint(y);
      addPoint(endY);
      segments = points.map((p, index) => `${index ? "L" : "M"}${p.x},${p.y}`);
      const path = segments.join(" ");
      base.setAttribute("d", path);
      live.style.strokeDasharray = "none";
      live.style.strokeDashoffset = "0";
      pathLength = base.getTotalLength();
      maskBackgroundRef.current.setAttribute("width", width);
      maskBackgroundRef.current.setAttribute("height", height);
      baseMaskBackgroundRef.current.setAttribute("width", width);
      baseMaskBackgroundRef.current.setAttribute("height", height);
      const radius = narrow ? 3.5 : 4.5;
      tip.setAttribute("r", radius);
      halo.setAttribute("r", narrow ? 6 : 9);
      dotsRef.current.replaceChildren();
      stops = [...content.querySelectorAll("[data-stop]")].map(section => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "thread__dot");
        circle.setAttribute("r", radius);
        circle.dataset.section = section.className;
        dotsRef.current.append(circle);
        return { section, circle };
      });
      focusOffset = stops.length
        ? anchorViewportY(stops[0].section) + scrollY - origin()
        : innerHeight * .5;
      tick();
    };
    const scheduleBuild = () => {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(build, 80);
      schedule();
    };
    content.addEventListener("pg:surface-updated", tick, { signal: controller.signal });
    window.addEventListener("scroll", schedule, { passive: true, signal: controller.signal });
    window.addEventListener("resize", scheduleBuild, { passive: true, signal: controller.signal });
    content.addEventListener("load", scheduleBuild, { capture: true, signal: controller.signal });
    motion.addEventListener("change", scheduleBuild, { signal: controller.signal });
    const observer = new ResizeObserver(scheduleBuild);
    observer.observe(content);
    [...content.querySelectorAll("[data-stop]")].forEach(section => observer.observe(section));
    let disposed = false;
    document.fonts?.ready.then(() => { if (!disposed) scheduleBuild(); });
    build();
    return () => {
      disposed = true;
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(rebuildTimer);
    };
  }, []);

  return <svg className="thread" ref={svgRef} aria-hidden="true">
    <defs><mask id="thread-gallery-mask" maskUnits="userSpaceOnUse">
      <rect ref={maskBackgroundRef} x="0" y="0" fill="white" />
      <path ref={galleryMaskRef} fill="black" />
    </mask>
    <mask id="thread-base-gallery-mask" maskUnits="userSpaceOnUse">
      <rect ref={baseMaskBackgroundRef} x="0" y="0" fill="white" />
      <path ref={baseGalleryMaskRef} fill="black" />
    </mask></defs>
    <path className="thread__base" ref={baseRef} mask="url(#thread-base-gallery-mask)" />
    <g mask="url(#thread-gallery-mask)">
    <path className="thread__live" ref={liveRef} />
    <g ref={dotsRef} />
    <circle className="thread__halo" ref={haloRef} r="9" cx="-99" cy="-99" />
    <circle className="thread__tip" ref={tipRef} r="4.5" cx="-99" cy="-99" />
    </g>
  </svg>;
}
