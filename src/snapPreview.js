// Cinematic scroll je uključen po zadanom. ?snap=0 ga isključuje (npr. za usporedbu),
// ?snap ga ponovno uključuje; izbor se pamti dok je kartica otvorena, pa vrijedi na
// svim stranicama.
export function snapPreviewEnabled() {
  try {
    const param = new URLSearchParams(window.location.search).get("snap");
    if (param !== null) sessionStorage.setItem("pg-snap", param === "0" ? "0" : "1");
    return sessionStorage.getItem("pg-snap") !== "0";
  } catch {
    return true;
  }
}
