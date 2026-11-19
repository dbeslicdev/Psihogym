# Independent second UI audit pass

Scope: audited only `C:\Projects\psihogym_ui_pass` at http://127.0.0.1:4182. The original source was not edited. This was an independent pass after the first agent completed its fixes.

## Confirmed finding and fix

The testimonial stack used only viewport media queries to decide whether a review could be pinned. On a 1280 × 720 viewport with text enlarged to 125% (20px root), the sticky card position was 290px while long reviews were 500px tall. Their lower edge therefore sat at 790px, outside the 720px viewport. This makes the reading position unsuitable and can obscure the lower text while previous cards move behind the heading.

`src/components/useReviewStack.js` now measures the resolved sticky offset and the tallest actual card. Sticky mode is used only when the entire card fits with 16px clearance. Otherwise reviews use normal document flow. The fallback removes the sticky heading and artificial leading scroll gap, clears transforms, `aria-hidden` and `inert`, and responds to viewport, card size and font size changes. Normal desktop mode and the existing push transition remain when they fit. An out-of-flow measuring node resolves the CSS calc without resetting card position on each frame.

`src/responsive-audit.css` contains the scoped flow fallback. `vite.config.js` now defaults this isolated copy to port 4182, so `npm run dev` does not conflict with the original port 4180.

## Verification

- Independent reduced-motion sweep: **77 route/viewport combinations**, 11 public routes at 320×568, 390×844, 768×1024, 955×860, 1280×720, 1920×1080 and 844×390. Routes: home, About, Counselling, Contact, Programs, all five program detail pages, empty Cart.
- No document overflow, no unintended out-of-viewport headings/paragraphs/inputs/buttons in this sweep, and no browser runtime errors. Intentionally clipped horizontal program rails and hidden menu/card layers were excluded from the out-of-viewport check.
- Standard-motion review geometry checked at 320, 390, 768, 955, 1024, 1280, 1366, 1920 and 2560 widths, including portrait and landscape heights.
- Menu opened at all of those viewport sizes; short-height menu content is in its own scroll surface rather than forced onto the screen.
- Regression reproduced at 125% text: fallback returns `flow`, heading is relative, all five review steps are relative, none are inert/aria-hidden, and transforms are cleared.
- Reverting text to 100% and resizing to 1920×1080 restores `sticky` mode.
- Production build: passed (Vite 6.4.3, 74 modules).

Raw verification: `qa/independent-final.json`. Additional measurement scripts/results live in that workspace. Parent agent independently verified populated Cart, portal, Contact switching and mobile menu keyboard behavior.

## Limits

Tested with Chromium-based Playwright emulation, not physical iOS Safari/Android devices or every possible resolution. The layout is fluid between tested boundaries, but physical-device/browser testing remains useful before production. The audit does not turn mock checkout, login or placeholder lesson videos into production integrations. No copy, program data or visual redesign was introduced in this pass.

