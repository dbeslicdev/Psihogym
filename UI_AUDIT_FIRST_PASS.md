# Psihogym UI audit — prvi prolaz

Datum: 3. 11. 2026.

## Izolacija projekta

Izvor: `C:/Projects/psihogym_ai_playground`.
Radna kopija: `C:/Projects/psihogym_ui_pass`.
Preview: http://127.0.0.1:4182/.
Izmjene su napravljene isključivo u kopiji. Svih 25 javnih datoteka kopirano je; podaci programa u src/data.js identični su originalu.

## Pokrivenost

88 kombinacija javne stranice i viewporta u prvom automatiziranom prolazu:
- Stranice: naslovnica, O nama, Savjetovanje, Programi, detalji emocionalnog razvoja i anksioznosti, Kontakt, Košarica.
- Viewporti: 320×740, 375×812, 390×844, 768×1024, 955×860, 1024×768, 1280×720, 1366×768, 1920×1080, 2560×1440, 844×390.
- Zasebno: otvorene kartice svih pet programa na 320/768/1024/1366 px; nije izmjereno preklapanje sadržaja s akcijama kartice.
- Portal i player nakon lokalne testne prijave te košarica s pet programa na 320/768/1024 px.
- Izbornik i obje kontakt forme na 320×568, 390×844, 640×450, 844×390, 955×860.
- Reduced motion: svi odlomci profesionalnog puta dostupni.

## Nalazi i popravci

### 1. Portal lekcija prelijeva se na 320 px — popravljeno

Prije: gornja traka, odjava, tab Refleksija, gumb Sljedeća i niz lekcija izlazili su preko desnog ruba. Npr. Odjava završavala na x=392.7 pri širini 320 px.
Uzrok: minimalne širine flex/grid djece i jedna neprelomljena traka/tabovi.
Popravak: shrinkable grid djeca, prelom trake i navigacije, tabovi u dva stupca, puni naziv programa u drugom redu, prelom imena i materijala.
Retest: nema document overflow ni kontrola izvan ekrana na 320/768/1024 px.

### 2. Suglasnost košarice raspada se u odvojene flex fragmente — popravljeno

Cijela rečenica i link sada su jedan tekstualni element; checkbox i rečenica imaju zasebne grid stupce.

### 3. Skučeni naslovi stavki košarice na uskom mobitelu — popravljeno

Naslov programa koristi puni redak, a cijena i Ukloni su ispod. Tekst nije smanjen niti izbačen.

### 4. Ključni sadržaj checkouta ovisi o reveal animaciji — uklonjeno

Naslov košarice, popis programa i plaćanje nisu skriveni početnim opacity:0. To sprječava prazan izgled prilikom promjene stanja i ubrzanog pomicanja.

### 5. Dugi SplitText odlomak u kratkom viewportu — ojačan trigger

Threshold od 25% zamijenjen je ulaskom elementa u viewport uz donji margin 10%. Odlomak koji je viši od više ekrana ne mora dosegnuti nedostupan prag vidljivosti. Animacija i slijed odlomaka ostaju isti.

### 6. Čitljivost kataloga na užem desktopu — minimalna širina

Kartica ne može biti uža od 18rem. Pravilo tri i pol kartice zadržava se kada ekran to može prikazati bez previše skučenog teksta. Na užim ekranima ostaje horizontalni niz i pristup svim programima.

### 7. Zaštita dugih riječi i polja

Grid djeca mogu se smanjiti, dugi naslovi/riječi mogu se prelomiti, mobilni inputi imaju najmanje 16 px kako iOS ne bi nepotrebno povećavao prikaz pri fokusiranju.

## Rezultati

Build uspješan. Javne stranice u početnoj matrici nemaju bočno document prelijevanje niti JavaScript pageerror. Portal je imao stvarno prelijevanje koje je uklonjeno. Testirane su obje forme, Drugo polja, skrivena forma ne zauzima prostor, menu Escape i skrolabilan menu na kratkom ekranu.

## Ograničenja

Automatizirano testiranje koristi Chromium s emulacijom touch/viewporta, a ne fizički iPhone niti zasebni Safari/Firefox. Pinned horizontalni niz namjerno djelomično pokazuje sljedeću karticu. Izvještaj o scrollWidth tijekom SplitText animacije može sadržavati prolazne transformacije; takvi rezultati nisu sami po sebi potvrđeni bugovi. Screenshot cijele stranice ne reproducira sve faze sticky/scroll animacija.
Plaćanja, autentikacija i video sadržaj ostaju postojeće lokalne demonstracije; backend nije mijenjan.

## Drugi prolaz

Nakon prvog prolaza pokrenut je neovisni subagent. Nalazi drugog prolaza nalaze se u UI_AUDIT_SECOND_PASS.md.
