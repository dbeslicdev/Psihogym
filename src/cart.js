import { useSyncExternalStore } from "react";

/* ============================================================
   Mock košarica + kupnje — localStorage, bez backenda.
   Košarica drži ID-eve programa; "kupnja" samo upiše ID u
   popis kupljenog (entitlement). Kasnije: orders tablica u
   bazi + webhook payment providera upisuje entitlement.
   ============================================================ */

const CART_KEY = "psihogym_cart";
const PURCHASE_KEY = "psihogym_purchases";

function read(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Keš s stabilnom referencom — potreban za useSyncExternalStore
let cartCache = read(CART_KEY);
let purchaseCache = read(PURCHASE_KEY);

const listeners = new Set();
function emit() {
  listeners.forEach((fn) => fn());
}

function writeCart(next) {
  cartCache = next;
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  emit();
}

export function getCart() {
  return cartCache;
}

export function addToCart(programId) {
  if (!cartCache.includes(programId)) writeCart([...cartCache, programId]);
}

export function removeFromCart(programId) {
  writeCart(cartCache.filter((id) => id !== programId));
}

export function clearCart() {
  writeCart([]);
}

export function getPurchases() {
  return purchaseCache;
}

export function isPurchased(programId) {
  return purchaseCache.includes(programId);
}

/** Mock "webhook" — nakon uspješnog plaćanja upiši entitlemente. */
export function markPurchased(programIds) {
  purchaseCache = [...new Set([...purchaseCache, ...programIds])];
  localStorage.setItem(PURCHASE_KEY, JSON.stringify(purchaseCache));
  emit();
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Reaktivan sadržaj košarice za React komponente. */
export function useCartItems() {
  return useSyncExternalStore(subscribe, getCart);
}
