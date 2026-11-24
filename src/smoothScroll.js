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
