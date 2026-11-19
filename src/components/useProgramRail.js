import { useEffect } from "react";

export default function useProgramRail(pinRef, trackRef, progressRef) {
  useEffect(() => {
    const section = pinRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const viewport = section.querySelector(".v4-programi__viewport");
    const head = section.querySelector(".v4-programi__head");
    const compact = window.matchMedia("(pointer: coarse), (max-width: 60rem), (max-height: 42rem)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const outer = new AbortController();
    const sticky = section.querySelector(".v4-programi__sticky");
    let staticMode;
    let maxOffset = 0;
    let pinTop = 0;
    let frame;
    let measureFrame;
    let lastOffset = -1;
    let wheelFrame;
    let wheelTarget;
    let wheelTime;
    let wheelPosition;
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
      const reserve = parseFloat(stickyStyle.paddingTop) + parseFloat(stickyStyle.paddingBottom)
        + 2 * parseFloat(stickyStyle.rowGap) + parseFloat(viewportStyle.paddingTop)
        + parseFloat(viewportStyle.paddingBottom) + progressRef.current.parentElement.offsetHeight;
      const contentHeight = stickyStyle.display === "grid"
        ? Math.max((head?.offsetHeight || 0), track.offsetHeight) : (head?.offsetHeight || 0) + track.offsetHeight;
      const nextStatic = compact.matches || motion.matches || contentHeight + reserve + pinTop > innerHeight;
      const changed = nextStatic !== staticMode;
      staticMode = nextStatic;
      if (changed || !staticMode) stopWheel();
      section.classList.toggle("v4-programi--static", staticMode);
      if (staticMode) {
        section.style.height = "";
        track.style.transform = "";
        if (progressRef.current) progressRef.current.style.width = "";
        lastOffset = -1;
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
      track.style.transform = "";
      if (progressRef.current) progressRef.current.style.width = "";
    };
  }, [pinRef, trackRef, progressRef]);
}
