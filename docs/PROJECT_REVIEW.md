# Pregled projekta — 3. studenoga 2026.

Opseg: radna kopija psihogym_ui_pass. Pregled koda i lokalnog builda; nije penetracijski test niti provjera javnog psihogym.hr ili pravno mišljenje.

## Zaključak
Marketing frontend je dobra osnova. Prodaja i LMS još su demonstracija, ne sustav spreman za stvarne kupce. Ne dodavati nove marketinške sekcije prije dovršavanja kupnje, isporuke sadržaja i administracije.

## Dobro napravljeno
- Zajednički ProgramPreviewCard i ProgramCard daju dosljednost katalogu i naslovnici.
- Centralni katalog data.js i lookup po ID-u smanjuju ponavljanje podataka.
- useProgramRail odvaja horizontalno listanje od prikaza kartice; postoje responsive i reduced-motion alternative.
- useSyncExternalStore omogućuje reaktivnu košaricu bez nepotrebne biblioteke stanja.
- Odvojeni marketing i korisnički portal, eksplicitni guardovi, prazna košarica i povratak na prijavu.
- Napredak i nastavak lekcije postoje kao UX koncept. Vizualni tokeni i ujednačen sustav animacija već su uspostavljeni.

## Kritično prije prodaje
1. **Autentikacija samo u browseru** — auth.js sadrži admin/admin i demo/demo te sessionStorage sesiju. Korisnik može mijenjati lokalne podatke. RequireAuth/hasAccess služe demonstraciji, ne zaštiti. Uvesti pravi identitet, serversku provjeru i autorizaciju svake lekcije/datoteke.
2. **Kupnja se može proizvoljno otključati** — KosaricaPage.handlePay nakon timeouta poziva markPurchased, a cart.js zapisuje ID-eve u localStorage. Plaćanje nije povezano s providerom. Server mora obračunati cijenu i dodijeliti pravo pristupa tek nakon provjere naplate.
3. **Kupnje i napredak nisu vezani uz korisnika** — psihogym_purchases i psihogym_progress globalni su ključevi preglednika. Dijeljeno računalo dijeli stanje, drugi uređaj ga nema. Model u bazi mora imati user_id i pravila pristupa po korisniku.
4. **Sadržaj nije spreman za isporuku** — data.js generira generičke naslove lekcija; ProgramPlayer ima placeholder videa, isti opis lekcije te gumbe Preuzmi bez radnje. Potrebni stvarni naslovi, video asseti, materijali po lekciji, titlovi i provjera prava na serveru prije izdavanja kratkotrajnih URL-ova.
5. **Kontakt se ne šalje** — KontaktPage.handleSubmit samo prikaže obavijest. Potrebni validacija na serveru, ograničenje broja zahtjeva, potvrda primitka i siguran prijenos. Ne slati zdravstvene opise u payment metadata, analitiku ni generičke logove.
6. **Bilješke nisu trajna pohrana** — player ih drži u React stanju; korisnik može misliti da je Spremi trajno. Prije produkcije odrediti pohranu, brisanje i očekivanja korisnika. Osjetljiv sadržaj zahtijeva zaseban pristupni model.

## Visoki prioritet
- Uvjeti korištenja u checkoutu su href="#". Potrebni pravi uvjeti prodaje: identitet trgovca, cijena/porezi, trajanje pristupa, isporuka, reklamacije, povrati i digitalni sadržaj. Pravila privatnosti nisu zamjena za ugovor o kupnji.
- Postojeći checkbox spaja uvjete i trenutačni pristup. Pravno provjeriti zaseban izričit zahtjev za početak isporuke i obavijest o učinku na pravo jednostranog raskida; pohraniti verziju i vrijeme prihvata. Ne proglašavati automatski da povrat nikada nije moguć.
- Tekst Cijene uključuju PDV treba potvrditi s računovođom prema stvarnom statusu obrta; nisam ga samostalno mijenjao.
- Nema potvrde kupnje e-poštom, stvarnih računa, povrata niti usklađivanja uplata s pravima pristupa.
- Uvesti administraciju narudžbi, ponovnu dostavu pristupa, evidenciju povrata, backup i isproban oporavak.
- Ugraditi reset lozinke/prijavu e-poštom, potvrdu adrese, odjavu svih sesija i razlikovati kupca od administratora.

## Održavanje i kvaliteta
- Više velikih CSS slojeva, stare v2/v3 rute i naknadni overrideovi povećavaju rizik regresije. Postupno odvojiti stilove komponenti, ukloniti neaktivne varijante nakon potvrde i održavati jedan izvor tokena.
- App.jsx nema catch-all 404; dodati korisnu stranicu s povratkom na programe.
- localStorage upisi ne hvataju greške kvote/zabrane. Napredak treba validirati prema stvarnim ID-evima lekcija; progressPct ne smije prijeći 100%.
- Broj scroll observera i animacija provjeriti profiliranjem na stvarnim mobitelima; postojeće emulator-provjere nisu zamjena za Safari i slabiji Android.
- Za javnu objavu provjeriti metadata, canonical, sitemap, robots i dijeljenje programskih URL-ova. Razmotriti prerender marketing ruta.
- Automatizirati testove kupnje, autorizacije, duplog webhooka, povrata i nastavka lekcije na drugom uređaju; dodati CI build.

## Privatnost i kolačići
Dodane su dvije odvojene rute i linkovi u footeru. Nacrti izričito navode testni status, četiri stvarna ključa pohrane, vanjske fontove, prava ispitanika i nedostajuće operativne podatke. Nije dodan izmišljeni cookie banner.

Za finalizaciju trebaju: hosting i lokacije obrade, e-mail servis, video servis, baza/autentikacija, provider plaćanja, stvarne lehotе čuvanja i brisanja, ugovori s izvršiteljima i osnova za posebne kategorije podataka. Domena sama ne otkriva hosting. Preporuka: lokalno posluživati fontove i smanjiti vanjske zahtjeve. Prije objave napraviti mrežni pregled javne stranice i preispitati svaki neobvezni alat. Ne tretirati svu lokalnu pohranu kao automatski izuzetu od privole.

## Plaćanje — preporučeni smjer
Početi jednim providerom. Za ovaj projekt predlažem hosted Stripe Checkout, uz prethodnu potvrdu dostupnosti računa i uvjeta za konkretan obrt. CorvusPay usporediti ako su domaća podrška i rate ključni; mogućnost rata ovisi o ugovoru i podržanim karticama. Nisam ugovarao provider niti aktivirao naplatu.

Cijena i prava pristupa žive na serveru. Browser šalje samo ID-eve programa. Backend kreira narudžbu i checkout sesiju; potpisani webhook potvrđuje plaćanje i transakcijski dodjeljuje prava. Ponovljeni događaj ne smije dodijeliti duplu kupnju. Povratna stranica samo čita status narudžbe. Refund/chargeback imaju zasebna pravila revokacije. Provider potvrda uplate nije automatski hrvatski račun; proces izdavanja i porezni tretman uskladiti s računovođom.

## Što još dodati
Prioritet: vidljivo trajanje pristupa programu, pregled stvarnog kurikuluma, jedna besplatna ogledna lekcija, tehnički zahtjevi i kontakt za pomoć. U portalu nastavak zadnje lekcije, stvarni materijali i jasna potvrda spremanja. Ne bih sada dodavao chat, gamifikaciju ni još animiranih sekcija.

## Redoslijed
1. Potvrditi poslovne uvjete i sadržaj svih pet programa.
2. Backend identitet + baza s pristupom po korisniku + privatna pohrana sadržaja.
3. Testni hosted checkout, webhook, prava pristupa, računi i e-mail.
4. Stvarni player i materijali, kontaktni backend, privatnost i pravila prodaje.
5. End-to-end testovi, backup, sigurnosna provjera i kontrolirana javna objava.

## Izvori
- https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- https://github.com/corvuspay/corvus-frame-integration-doc
- https://azop.hr/kolacici-gdpr/
- https://azop.hr/obrada-osobnih-podataka-putem-kolacica-eng-cookies/
