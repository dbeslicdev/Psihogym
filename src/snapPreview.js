// Cinematic scroll (pregled): ?snap uključuje, ?snap=0 isključuje; izbor se pamti
// dok je kartica otvorena, pa vrijedi na svim stranicama.
export function snapPreviewEnabled() {
  try {
    const param = new URLSearchParams(window.location.search).get("snap");
    if (param !== null) sessionStorage.setItem("pg-snap", param === "0" ? "0" : "1");
    return sessionStorage.getItem("pg-snap") === "1";
  } catch {
    return false;
  }
}
