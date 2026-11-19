# Psihogym UI pass

Radna kopija: C:\Projects\psihogym_ui_pass
Original: C:\Projects\psihogym_ai_playground (nije mijenjan)
Preview: http://127.0.0.1:4182/

## Rezultat

Dovršena su dva uzastopna prolaza: prvi audit i popravci te neovisni audit subagenta s dodatnim popravkom.

- Portal lekcija na 320 px: uklonjeno prelijevanje topbara, tabova, navigacije i naziva lekcija.
- Košarica: naslov stavke ima vlastiti red na uskom ekranu; suglasnost se prelama kao povezana rečenica; ključni sadržaj plaćanja ne ovisi o reveal animaciji.
- Animirani dugi tekst: trigger radi i u kratkim prozorima gdje 25% elementa ne bi moglo biti vidljivo.
- Kartice programa: minimalna čitljiva širina na užem desktopu, uz horizontalni niz.
- Dugi naslovi i grid/flex djeca: omogućeno prelamanje i smanjivanje bez bočnog izlaska.
- Kontakt: mobilni font polja 16px; provjerene obje forme i Drugo polja.
- Recenzije: sticky samo kada najviša kartica stane u prozor; inače čitljiv običan vertikalni slijed, uključujući povećani tekst.

## Provjere

Završna regresija: 121 kombinacija (11 javnih ruta × 11 viewporta), bez document overflow, JavaScript pageerror i neispravnih slika.
Neovisna regresija: 77 kombinacija sa smanjenim animacijama, bez neočekivano izmaknutih vidljivih elemenata.
Dodatno: aktivne kartice, mobilni meni/Escape, obje Kontakt forme, popunjena i prazna košarica, lokalna testna prijava, dashboard i player, promjena veličine te povećani tekst.
Završni production build uspješan.

Viewporti završne regresije: 320×568, 375×812, 390×844, 768×1024, 955×860, 1024×768, 1280×720, 1366×768, 1920×1080, 2560×1440, 844×390.

## Izvještaji i dokazi

- UI_AUDIT_FIRST_PASS.md — detalji prvog prolaza.
- UI_AUDIT_SECOND_PASS.md — neovisni nalaz, popravak i verifikacija.
- qa/regression.json — završnih 121 rezultata.
- qa/independent-final.json — neovisna provjera.
- qa/forms-menu.json — interakcije formi i menija.
- qa/*.mjs — testne skripte.
- src/responsive-audit.css — objedinjeni responzivni overridei ovog prolaza.

## Pokretanje

U ovom folderu: npm run dev
Zadani port kopije je 4182. npm run build izrađuje dist.

## Granice provjere

Testirano u Chromiumu s emulacijom različitih viewporta i dodira. Nisu testirani fizički iPhone/Android niti zasebni Safari/Firefox. Tvrdnja nije da je pojedinačno ispitan svaki mogući ekran, nego da su provjerene navedene granice i prilagodljivi prijelazi. Horizontalni niz namjerno prikazuje dio sljedeće kartice; sve kartice dostupne su scrollom/swipeom ili fokusiranjem. Postojeći demonstracijski checkout, prijava i video izvori nisu pretvarani u produkcijske integracije.
