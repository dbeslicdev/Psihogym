// Jedina Lenis instanca (postavlja je App). Moduli koji moraju trenutačno
// pomaknuti stranicu (npr. galerija programa korak po korak) idu preko nje,
// inače bi Lenis nastavio svoju animaciju i pregazio pomak.
export const smoothScroll = { instance: null };

export function jumpTo(top) {
  if (smoothScroll.instance) smoothScroll.instance.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "instant" });
}
