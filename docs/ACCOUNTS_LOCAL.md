# Lokalni korisnički računi i baza

Radna kopija: psihogym_ui_pass. Original nije mijenjan.

## Pokretanje (Node 24)
1. U PowerShellu u ovoj mapi: `$env:ALLOW_TEST_PURCHASES="true"` pa `npm run api`.
2. U drugom terminalu `npm run dev`. Vite na 4182 prosljeđuje /api lokalnom API-ju na 4183.
3. /programi#prijava → Registriraj se. Ime, e-mail i najmanje 12 znakova lozinke. Nema ugrađenog admin računa.
4. Dodaj program u košaricu i prijavljen/a odaberi jasno označenu testnu kupnju. Program se pojavi u /app. Napredak ostaje nakon odjave, restartanja API-ja i prijave istim računom u drugom pregledniku.

Bez ALLOW_TEST_PURCHASES=true endpoint testnih kupnji je onemogućen. Stvarno plaćanje nije povezano. Svi lokalni testni zapisi imaju kind=test i ne smiju se migrirati u plaćena prava pristupa.

## Podaci i zaštita
server/data/accounts.sqlite, WAL prateće datoteke: nisu u gitu, public ili frontend bundleu. API sluša samo na 127.0.0.1. Za backup ugasiti API pa kopirati bazu i eventualne WAL datoteke zajedno; testirati povrat. Pristup računalu i disku štititi OS pravima i enkripcijom diska.

Tablice: users, sessions, purchases, purchase_renewals, progress. Parametrizirani SQL, foreign keys, jedinstven korisnik/program, korisnik se izvodi iz serverske sesije. Lozinke: scrypt + slučajna sol. Tokeni sesije: 32 slučajna bajta; u bazi samo SHA-256 tokena, u browseru HttpOnly cookie. Origin kontrola POST/PUT, SameSite=Strict, rate limit prijave/registracije, ograničenje tijela i validacija ID-eva lekcija. Sesije traju sedam dana, odjava opoziva trenutnu sesiju.

Stara lokalna demo prijava i kupljeni programi ne daju nikakva prava. Browser guard služi UX-u; API zasebno autorizira pristup i svako spremanje napretka. Javni katalog prikazuje naslove i raspored. Opise lekcija i samorefleksija vraća ruta GET /api/programs/:id/curriculum nakon provjere korisnika i 90-dnevnog pristupa. Testna obnova nakon isteka zadržava napredak. Videozapisi, PDF dnevnici i literatura još nisu isporučeni.

## Provjere
`npm run test:accounts`: dva računa, autentikacija, CSRF/origin, izolacija prava i napretka, nepoznate lekcije, idempotentna testna kupnja, zatvaranje/otvaranje baze, odjava, isključen testni endpoint.
`npm run build`.

## Granica ove isporuke
Ovo su stvarni lokalni računi i trajna baza, ali nije produkcijski servis. Server odbija NODE_ENV=production. Prije objave: odabir hostinga/upravljanog identiteta, HTTPS i Secure cookie, potvrda e-maila, tokenizirani reset lozinke i mail servis, distribuirano ograničenje zahtjeva, backup/restore, brisanje računa, observability bez osobnih podataka, stvarni payment webhook i privatna isporuka videa. Postojeća Supabase shema je referenca za budući deployment; nije aktivirana niti automatski usklađena s lokalnim SQLiteom.

Ne unositi stvarne osjetljive bilješke: bilješke playera još su privremeni React state. Kupnje i napredak jesu serverski per-user; bilješke su zaseban sljedeći zahvat.
