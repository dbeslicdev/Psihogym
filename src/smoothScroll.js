// Jedina Lenis instanca (postavlja je App). Moduli koji moraju trenutačno
// pomaknuti stranicu (npr. galerija programa korak po korak) idu preko nje,
// inače bi Lenis nastavio svoju animaciju i pregazio pomak.
export const smoothScroll = { instance: null };

// Nakon programskog pomaka javljamo SCROLL_JUMP: linija s lijeve strane i valovi
// tada se iscrtaju odmah, a ne tek na sljedeći scroll event (kadar kasnije), inače
// bi kuglica na liniji poskočila dok stranica mekano klizi.
export const SCROLL_JUMP = "pg:scroll-jump";

export function jumpTo(top) {
  if (smoothScroll.instance) smoothScroll.instance.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "instant" });
  window.dispatchEvent(new Event(SCROLL_JUMP));
}

// Cinematic skok na stanicu: meko ubrzanje i usporenje, bez korisnikova
// utjecaja dok traje (lock). onComplete se zove kad Lenis stigne; ako skok
// prekine trenutačni jumpTo (galerija na rubu zone), poziva ga pozivatelj
// sam preko zaštitnog tajmera.
const easeInOutCubic = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export function glideTo(top, { duration = .9, onComplete } = {}) {
  if (smoothScroll.instance) {
    smoothScroll.instance.scrollTo(top, { duration, easing: easeInOutCubic, lock: true, force: true, onComplete });
  } else {
    window.scrollTo({ top, behavior: "smooth" });
    if (onComplete) setTimeout(onComplete, duration * 1000);
  }
}
