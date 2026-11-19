-- ============================================================
-- PSIHOGYM LMS — demo sadržaj za razvoj (NE puštati u produkciju)
-- ============================================================

insert into public.programs (id, slug, title, subtitle, description, price_cents, is_published)
values (
  '11111111-1111-1111-1111-111111111111',
  'centar-unutarnje-snage',
  'Centar unutarnje snage',
  'Online program za rad na sebi',
  'Program koji te kroz video lekcije, vježbe i radne listove vodi od razumijevanja vlastitih obrazaca do konkretnih alata za svakodnevicu.',
  9900,
  true
);

insert into public.modules (id, program_id, title, sort_order) values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Dobrodošlica', 1),
  ('22222222-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Razumijevanje sebe', 2),
  ('23333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Alati i tehnike', 3),
  ('24444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Integracija', 4);

insert into public.lessons (id, module_id, title, duration_seconds, is_free_preview, sort_order) values
  ('31111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 'Kako koristiti program', 252, true, 1),
  ('32222222-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 'Kako nastaje promjena', 465, false, 2),
  ('33333333-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'Mapa unutarnjih stanja', 750, false, 1),
  ('34444444-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'Prepoznavanje okidača', 618, false, 2),
  ('35555555-1111-1111-1111-111111111111', '22222222-1111-1111-1111-111111111111', 'Vježba: dnevnik okidača', 365, false, 3),
  ('36666666-1111-1111-1111-111111111111', '23333333-1111-1111-1111-111111111111', 'Tehnika disanja 4-7-8', 520, false, 1),
  ('37777777-1111-1111-1111-111111111111', '23333333-1111-1111-1111-111111111111', 'Postavljanje granica u praksi', 862, false, 2),
  ('38888888-1111-1111-1111-111111111111', '23333333-1111-1111-1111-111111111111', 'Rad s unutarnjim kritičarem', 707, false, 3),
  ('39999999-1111-1111-1111-111111111111', '24444444-1111-1111-1111-111111111111', 'Tjedni plan prakse', 555, false, 1),
  ('3aaaaaaa-1111-1111-1111-111111111111', '24444444-1111-1111-1111-111111111111', 'Kako dalje nakon programa', 330, false, 2);

-- Placeholder Bunny ID-evi (zamijeniti pravima nakon uploada)
insert into public.lesson_media (lesson_id, bunny_video_id)
select id, 'PLACEHOLDER-' || left(id::text, 8) from public.lessons;

insert into public.lesson_assets (lesson_id, title, kind, storage_path, sort_order) values
  ('34444444-1111-1111-1111-111111111111', 'Radni list — dnevnik okidača', 'pdf', 'centar-unutarnje-snage/okidaci-radni-list.pdf', 1),
  ('34444444-1111-1111-1111-111111111111', 'Vođena audio vježba (12 min)', 'audio', 'centar-unutarnje-snage/okidaci-vjezba.mp3', 2),
  ('34444444-1111-1111-1111-111111111111', 'Sažetak lekcije', 'pdf', 'centar-unutarnje-snage/okidaci-sazetak.pdf', 3);
