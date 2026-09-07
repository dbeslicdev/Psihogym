# Psihogym — Design tokeni

Jedan izvor istine, izvučen iz v4 "Utočište". Definirani u `src/tokens.css`
(globalno, `:root`), učitani prije `index.css` u `main.jsx`.
Koristi svugdje preko `var(--ps-…)`.

## Boje

### Paleta (primitivi)
| Token | Vrijednost | Uloga |
|---|---|---|
| `--ps-cream` | `#faf6f0` | topla krem podloga |
| `--ps-lavender` | `#c9c3e6` | glavni akcent |
| `--ps-lavender-soft` | `#e4e0f4` | svijetla lavanda (ambijent) |
| `--ps-blush` | `#f2d8d5` | topli rozé |
| `--ps-blush-soft` | `#f9eae8` | |
| `--ps-sage` | `#a8b5a1` | smirujuća kadulja |
| `--ps-sage-soft` | `#dde5d8` | |
| `--ps-ink` | `#3a3547` | tamnoljubičasti ugljen (tekst) |
| `--ps-white` | `#ffffff` | |

### Role (koristi OVE u komponentama)
| Token | → | Za što |
|---|---|---|
| `--ps-surface` | cream | podloga stranice |
| `--ps-surface-raised` | white | kartice |
| `--ps-text` | ink | glavni tekst |
| `--ps-text-muted` | ink 62% | sekundarni tekst |
| `--ps-text-faint` | ink 40% | natuknice |
| `--ps-border` | ink 14% | hairline rubovi |
| `--ps-accent` | lavender | naglasak, hover |
| `--ps-tint-lavender/blush/sage` | soft pastele | smjena pozadine sekcija |

## Tipografija

| Obitelj | Token | Font |
|---|---|---|
| Display | `--ps-font-display` | Instrument Serif |
| Tekst | `--ps-font-body` | Mulish |
| Mono | `--ps-font-mono` | Geist Mono |

### Skala (fluidna, clamp)
| Token | Raspon | Za što |
|---|---|---|
| `--ps-text-display-xl` | 64→160px | hero ime |
| `--ps-text-display-l` | 42→72px | naslov sekcije |
| `--ps-text-display-m` | 28→48px | velika rečenica (emphasis) |
| `--ps-text-title` | 24→34px | naslov kartice |
| `--ps-text-lead` | 20px | uvodni odlomak |
| `--ps-text-body` | 16px | tekst |
| `--ps-text-label` | 12.5px | mono labela (uppercase) |

Prored: `--ps-leading-tight` 1.05 · `--ps-leading-snug` 1.2 · `--ps-leading-body` 1.6
Labela: `--ps-tracking-label` 0.16em, uppercase.

## Razmak
`--ps-inset` (bočni gutter) · `--ps-section-y` (vertikalni ritam) —
nasljeđuju postojeći responzivni sustav. Sitno: `--ps-gap-sm/gap/gap-lg`.

## Zaobljenja
`--ps-radius-sm` 0.75rem · `--ps-radius` 1.1rem · `--ps-radius-lg` 1.5rem ·
`--ps-radius-pill` 999px · `--ps-arch` (luk za portretne slike).

## Sjene
`--ps-shadow-soft` (kartica) · `--ps-shadow-lift` (izdignuto).

## Pokret
`--ps-ease` `cubic-bezier(0.25, 1, 0.35, 1)` — mekana krivulja.
`--ps-dur` 1.1s (hover/bg morph) · `--ps-dur-in` 1.3s (ulazna animacija).

---

### Primjer
```css
.kartica {
  background: var(--ps-surface-raised);
  color: var(--ps-text);
  border: 1px solid var(--ps-border);
  border-radius: var(--ps-radius-lg);
  box-shadow: var(--ps-shadow-soft);
  transition: transform var(--ps-dur) var(--ps-ease);
}
.kartica__naslov {
  font-family: var(--ps-font-display);
  font-size: var(--ps-text-title);
  line-height: var(--ps-leading-tight);
}
```
