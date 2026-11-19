-- ============================================================
-- PSIHOGYM LMS — inicijalna shema + RLS
-- Pokreće se u Supabase SQL editoru ili preko `supabase db push`.
--
-- Sigurnosna načela:
--  * RLS je uključen na SVIM tablicama.
--  * Tablice bez policyja (lesson_media, stripe_events) su time
--    potpuno nedostupne klijentu — čita ih samo service role
--    (Edge Functions). Bunny video ID nikad ne dolazi u browser.
--  * Prava pristupa (entitlements) upisuje isključivo server
--    (Stripe webhook) — klijent ih može samo čitati, i to svoje.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES — profil korisnika (1:1 s auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Automatsko kreiranje profila pri registraciji
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: je li trenutni korisnik admin?
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Guard: korisnik ne smije sam sebi promijeniti rolu.
-- (auth.uid() je NULL za service role / SQL editor — njima je dopušteno.)
create function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Nije dopušteno mijenjati rolu.';
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ------------------------------------------------------------
-- 2. PROGRAMS — programi (proizvodi koji se kupuju)
-- ------------------------------------------------------------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  cover_url text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'eur',
  stripe_price_id text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. MODULES — cjeline unutar programa
-- ------------------------------------------------------------
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  title text not null,
  sort_order integer not null default 0
);

create index modules_program_idx on public.modules (program_id, sort_order);

-- ------------------------------------------------------------
-- 4. LESSONS — lekcije (METAPODACI — bez video ID-a!)
-- ------------------------------------------------------------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  description text,
  duration_seconds integer,
  is_free_preview boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index lessons_module_idx on public.lessons (module_id, sort_order);

-- Helper: program kojem lekcija pripada
create function public.lesson_program_id(p_lesson_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.program_id
  from lessons l
  join modules m on m.id = l.module_id
  where l.id = p_lesson_id;
$$;

-- ------------------------------------------------------------
-- 5. LESSON_MEDIA — Bunny video ID-evi (SAMO SERVER!)
--    RLS uključen, NEMA policyja => klijent nema pristup.
--    Čita isključivo Edge Function sa service ključem, koja
--    nakon provjere prava izda potpisani playback token.
-- ------------------------------------------------------------
create table public.lesson_media (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  bunny_video_id text not null,
  bunny_library_id text
);

-- ------------------------------------------------------------
-- 6. LESSON_ASSETS — popratni materijali (PDF, audio, linkovi)
--    Datoteke žive u PRIVATNOM Storage bucketu; ovdje su samo
--    metapodaci. Download ide preko potpisanog URL-a s servera.
-- ------------------------------------------------------------
create table public.lesson_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('pdf', 'audio', 'link', 'download')),
  storage_path text,
  external_url text,
  sort_order integer not null default 0
);

create index lesson_assets_lesson_idx on public.lesson_assets (lesson_id, sort_order);

-- ------------------------------------------------------------
-- 7. ENTITLEMENTS — prava pristupa (upisuje SAMO server)
-- ------------------------------------------------------------
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked', 'refunded')),
  source text not null default 'stripe' check (source in ('stripe', 'manual')),
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now(),
  unique (user_id, program_id)
);

create index entitlements_user_idx on public.entitlements (user_id);

-- Helper: ima li trenutni korisnik aktivno pravo na program?
create function public.has_entitlement(p_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from entitlements
    where user_id = auth.uid()
      and program_id = p_program_id
      and status = 'active'
  );
$$;

-- Helper: smije li trenutni korisnik pristupiti lekciji?
-- (kupio program ILI je lekcija besplatni preview ILI je admin)
create function public.can_access_lesson(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from lessons l
    where l.id = p_lesson_id
      and (
        l.is_free_preview
        or public.has_entitlement(public.lesson_program_id(l.id))
        or public.is_admin()
      )
  );
$$;

-- ------------------------------------------------------------
-- 8. PROGRESS — napredak (resume pozicija + završenost)
-- ------------------------------------------------------------
create table public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  position_seconds integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create function public.progress_before_write()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.completed and (tg_op = 'INSERT' or not old.completed) then
    new.completed_at = coalesce(new.completed_at, now());
  elsif not new.completed then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger progress_write
  before insert or update on public.progress
  for each row execute function public.progress_before_write();

-- ------------------------------------------------------------
-- 9. NOTES — bilješke korisnika uz lekciju
-- ------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_lesson_idx on public.notes (user_id, lesson_id);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_touch
  before update on public.notes
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 10. STRIPE_EVENTS — idempotencija webhooka (SAMO SERVER)
--     Isti Stripe event (evt_...) ne smije se obraditi dvaput.
-- ------------------------------------------------------------
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ============================================================
-- RLS — uključi na svemu, pa dodaj policyje
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.programs       enable row level security;
alter table public.modules        enable row level security;
alter table public.lessons        enable row level security;
alter table public.lesson_media   enable row level security;  -- bez policyja!
alter table public.lesson_assets  enable row level security;
alter table public.entitlements   enable row level security;
alter table public.progress       enable row level security;
alter table public.notes          enable row level security;
alter table public.stripe_events  enable row level security;  -- bez policyja!

-- ---------- profiles ----------
create policy "profiles: vlastiti select"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: vlastiti update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------- programs (javno čitljivi ako su objavljeni) ----------
create policy "programs: objavljeni su javni"
  on public.programs for select
  using (is_published or public.is_admin());

create policy "programs: admin upravlja"
  on public.programs for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- modules ----------
create policy "modules: vidljivi uz objavljen program"
  on public.modules for select
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_id and (p.is_published or public.is_admin())
    )
  );

create policy "modules: admin upravlja"
  on public.modules for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- lessons (metapodaci vidljivi za kurikulum na prodajnoj) ----------
create policy "lessons: vidljive uz objavljen program"
  on public.lessons for select
  using (
    exists (
      select 1
      from public.modules m
      join public.programs p on p.id = m.program_id
      where m.id = module_id and (p.is_published or public.is_admin())
    )
  );

create policy "lessons: admin upravlja"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- lesson_media: NEMA POLICYJA (namjerno — samo service role) ----------

-- ---------- lesson_assets (metapodaci samo uz pravo pristupa) ----------
create policy "assets: uz pravo pristupa"
  on public.lesson_assets for select
  using (public.can_access_lesson(lesson_id));

create policy "assets: admin upravlja"
  on public.lesson_assets for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- entitlements (klijent samo čita svoje) ----------
create policy "entitlements: vlastiti select"
  on public.entitlements for select
  using (user_id = auth.uid() or public.is_admin());

-- INSERT/UPDATE/DELETE namjerno bez policyja — piše samo server (webhook).

-- ---------- progress (vlastiti CRUD, ali samo za dostupne lekcije) ----------
create policy "progress: vlastiti select"
  on public.progress for select
  using (user_id = auth.uid());

create policy "progress: vlastiti insert"
  on public.progress for insert
  with check (user_id = auth.uid() and public.can_access_lesson(lesson_id));

create policy "progress: vlastiti update"
  on public.progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.can_access_lesson(lesson_id));

-- ---------- notes (vlastiti CRUD, samo za dostupne lekcije) ----------
create policy "notes: vlastiti select"
  on public.notes for select
  using (user_id = auth.uid());

create policy "notes: vlastiti insert"
  on public.notes for insert
  with check (user_id = auth.uid() and public.can_access_lesson(lesson_id));

create policy "notes: vlastiti update"
  on public.notes for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notes: vlastiti delete"
  on public.notes for delete
  using (user_id = auth.uid());
