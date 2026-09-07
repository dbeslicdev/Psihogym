# Psihogym LMS — baza (Supabase)

## Kako primijeniti shemu

**Opcija A — Supabase Dashboard (najjednostavnije):**
1. Otvori projekt (regija: **EU / Frankfurt** zbog GDPR-a) → SQL Editor.
2. Zalijepi i pokreni `migrations/0001_init.sql`.
3. (Za razvoj) pokreni i `seed.sql` — demo program s 10 lekcija.

**Opcija B — Supabase CLI:**
```bash
supabase link --project-ref <ref>
supabase db push
```

## Nakon primjene

- **Prvi admin:** registriraj se kroz app, pa u SQL editoru:
  `update public.profiles set role = 'admin' where id = '<tvoj-user-id>';`
- **Storage:** ručno kreiraj **privatni** bucket `lesson-assets` (bez javnih policyja — download ide preko potpisanih URL-ova s Edge Functiona).
- **Auth:** uključi Email (s potvrdom) + Google provider u Authentication → Providers.

## Sigurnosni model (ukratko)

| Tablica | Klijent smije |
|---|---|
| `profiles` | čitati/uređivati svoj profil (rolu NE — trigger guard) |
| `programs`, `modules`, `lessons` | čitati objavljeno (za prodajnu stranicu); **bez video ID-eva** |
| `lesson_media` | **ništa** — RLS bez policyja; čita samo Edge Function (service role) |
| `lesson_assets` | čitati metapodatke samo uz kupljen program / free preview |
| `entitlements` | čitati svoje; **upisuje samo Stripe webhook** |
| `progress`, `notes` | vlastiti CRUD, i to samo za dostupne lekcije |
| `stripe_events` | ništa — interna idempotencija webhooka |

Ključne funkcije: `is_admin()`, `has_entitlement(program_id)`, `can_access_lesson(lesson_id)` — sve `security definer`, koriste se u RLS policyjima i Edge Functionima.
