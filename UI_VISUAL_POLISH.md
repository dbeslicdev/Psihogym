# Vizualni prolaz kroz četiri rezolucije

Audit kopija: C:\Projects\psihogym_ui_pass. Original nije mijenjan.

## Metoda

Pregledani su stvarni viewport screenshotovi, ne samo document overflow. Veličine: 390×844 (mobitel), 907×864 (responsive touch emulacija), 1366×768 (manji desktop), 1920×1080 (veliki desktop).

Po svakoj veličini pregledani su naslovnica (hero, profil, teme, online, programi, brojke, recenzije, završetak), O nama (oba tekstualna dijela), Programi i prijava, Kontakt, detalj programa. Savjetovanje je dodatno pregledano kroz sve četiri obojane cjeline. Recenzije su pomaknute naprijed i natrag kroz više pozicija. Kotačić testiran na horizontalnim karticama i u emulaciji dodira.

## Potvrđeni vizualni problemi i dorade

1. Maska naslova recenzija bila je visoka 100svh i crtala se preko prethodnih sekcija. Uklonjena je. Sticky zaglavlje sada pokriva samo vlastitu kutiju, s rezerviranim prostorom za navigaciju. Brojke i kartice iznad ostaju vidljive.
2. Dolazeće podloge mogle su prijeći preko završnog gumba ili teksta prethodne sekcije. Podloge sada mjere donji rub sadržaja i ostavljaju 24–48px sigurnog prostora. Primijenjeno na Online → Programi, Programi → statistika, tekstualne cjeline O nama i cjeline Savjetovanja.
3. Naslov statistike mogao se dizati izvan vlastite zelene podloge i preko kartica programa. Ograničeno je dizanje prema prethodnom sadržaju i unutarnjem razmaku podloge.
4. Skratili su se prazni završeci tekstualnih sekcija: umjesto približno 290–427px sada prilagodljivih 6rem–14rem (18svh unutar granica). Sljedeća podloga pritom ne smije prekriti tekst.
5. Recenzije su imale 25–45svh praznine između koraka. Ritam je sada 16svh odnosno 22svh za dulju recenziju, uz min/max granice. Push efekt i čitljivost kartice ostaju.
6. Na nižem desktopu velika skala kartica prisiljavala je galeriju u složeni vertikalni raspored. Na desktop prozorima do 900px visine skala je 1.05, dok veliki desktop zadržava raniju 1.25 skalu. Na 1366×768 galerija ponovno radi u pinned horizontalnom rasporedu.
7. Smanjen je suvišan gornji razmak galerije u kompaktnom načinu i zadržan donji razmak prije sljedeće cjeline. Katalog ima vlastito zaglavlje i ostaje odvojen.
8. Geometrija maske smeđe crte sada čita stvarno nacrtanu granicu plave podloge kako se ne bi razišla s novim zaštitnim ograničenjem.
9. Objedinjena su ponovljena/poništena pravila responzivnog audita u jedan pregledniji skup.

## Provjere

- Horizontalno pomicanje kotačićem: uspješno na sve četiri veličine, uključujući touch emulaciju.
- Sticky recenzije: rade na sve četiri veličine kada kartice stanu; naslov ima isti položaj pri naprijed/natrag pomicanju, a umirovljene kartice ponovno su dostupne pri vraćanju.
- Završni četverostruki prolaz naslovnice: nema bočnog document prelijevanja ni JavaScript pageerror.
- Savjetovanje na sve četiri veličine: nema document prelijevanja ni JavaScript pageerror.
- Build: uspješan.

Sadržaj, cijene i tekstovi nisu prepravljani. Fizički uređaji i Safari/Firefox nisu testirani; korištena je Chromium emulacija. Screenshot predstavlja određeni trenutak scrolla, a ne sve faze animacije odjednom.

Dokazi: qa/visual-polish. Priloženi screenshotovi prikazuju novi raspored galerije, povratak na recenzije i razmake u O nama.
