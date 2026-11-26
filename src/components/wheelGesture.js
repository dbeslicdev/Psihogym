/* Prepoznavanje poteza kotačića/touchpada: niz wheel događaja dijeli se na poteze,
   da jedan potez znači jednu radnju (jedna kartica u galeriji, jedna stanica pri
   cinematic scrollu), a ostatak poteza (inercija touchpada) se zanemari.
   Novi potez je:
    - događaj nakon stanke dulje od 140 ms;
    - zubac miša: wheelDelta u koracima od 120 (ili deltaMode u redcima), barem
      ~30 px i iste jačine kao prethodni događaj (zupci su uvijek jednaki, a
      touchpad na Macu povremeno pogodi višekratnik 120, ali s drugom jačinom);
    - promjena smjera (inercija ne mijenja smjer);
    - na touchpadu porast delte nakon što je inercija počela slabjeti (zamah
      raste pa pada; porast tijekom rasta nije novi potez);
    - potez bez stanke ipak ne traje dulje od 1,5 s, da se ništa ne zaglavi. */
export function createWheelGesture() {
  let lastWheel = 0;
  let previousSize = 0;
  let previousSign = 0;
  let peakSize = 0;
  let gestureStart = 0;
  return {
    /** Vraća { delta, fresh } ili null kad događaj nema pomaka. */
    read(event, now = performance.now()) {
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return null;
      const size = Math.abs(delta);
      const sign = Math.sign(delta);
      const wheelDelta = Math.abs(event.wheelDeltaY || 0);
      const pause = now - lastWheel > 140;
      const steady = Math.abs(size - previousSize) <= Math.max(2, size * .1);
      const notch = event.deltaMode === 1 || (size >= 30 && wheelDelta >= 120 && wheelDelta % 120 === 0 && (pause || steady));
      const flick = previousSize < peakSize && size >= 1.5 * previousSize && size - previousSize >= 8;
      const fresh = pause || notch || flick || sign !== previousSign || now - gestureStart > 1500;
      lastWheel = now;
      if (fresh) { gestureStart = now; peakSize = size; } else peakSize = Math.max(peakSize, size);
      previousSize = size;
      previousSign = sign;
      return { delta, fresh };
    },
    /** Vrijeme zadnjeg događaja (za "ulazak kotačićem" u galeriju). */
    get lastWheel() { return lastWheel; },
  };
}
