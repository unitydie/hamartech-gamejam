# HamarTech GameJam – prosjektinfo (NO)

## Hva dette er
En enkel webside for HamarTech GameJam med noen leke-elementer:
- Landingsside med hero, tidsplan, regler, påmelding/innsending.
- Lysløype-effekt (TorchRunner) som følger museklikk, med fakler og skygge.
- “Dragon gate” minispill: klikk for å skyte piler, dragen skyter ildkuler tilbake.
- Innsendinger lagres lokalt i `localStorage` og via et lite Express-API.

## Stack og avhengigheter
- Node.js 18+ (testet), NPM
- Express 4 (kun statiske filer + enkel JSON-lagring)
- Ingen byggsteg/bundler; ren HTML/CSS/JS

## Kjør lokalt
```bash
npm install
npm start
# åpner på http://localhost:8000/hamartech-gamejam/
```
Tilpass base/port om du vil:
```bash
$env:BASE_PATH="/"; $env:PORT=3000; npm start
# http://localhost:3000/
```

## Struktur
- `index.html`: hovedside/hero, navigasjon, forms, linker.
- `projects.html`: prosjektside (liste-kort).
- `assets/css/styles.css`: all styling (layout, hero, skjemaer, minispill, overlay).
- `assets/js/app.js`: all frontend-logikk (se “Frontend-moduler” under).
- `server.js`: Express-server + enkel filbasert lagring av innsendinger i `data/submissions.json`.
- `data/`: lagring av innsendinger (autoopprettes).
- `assets/sfx` og `assets/img`: sprites/lyder til lysløype og dragen.

## Frontend-moduler (assets/js/app.js)
- **PageTransition/SmoothAnchors/Reveal/MobileMenu/Accordion**: UI-hjelpere for navigasjon, fade-in, mobilmeny, FAQ.
+- **Toast**: små statusmeldinger.
+- **CopyLink**: kopierer side-URL.
+- **Countdown**: nedtelling til frist (`JAM_CONFIG.submitDeadline`).
+- **FormUX + attachLocalForms**: validering, lokal lagring i `localStorage`, sender POST til `/api/submissions`.
+- **CardTilt**: enkel 3D-tilt på kort.
+- **TorchRunner**: lysløype + “løper” som følger klikk, legger fakler, spiller lyd/ild-effekt.
+- **DragonGate**: drage som skyter ildkuler mot løperen; klikk på dragen skyter piler tilbake; etter 5 treff spilles sluttsekvens.
+- **PauseToggle**: knapp som pauser dragens angrep (spilleren kan fortsatt angripe).
+- **TextScramble/TitleScramble**: ASCII-scramble-logo (“HAMAR GAME JAM”) i header.

## API (server.js)
- `POST /api/submissions` lagrer et JSON-objekt i `data/submissions.json` (autoopprettes).
- `GET /api/submissions` returnerer alle innsendte poster.
- Base-path styres av `BASE_PATH` (default `/hamartech-gamejam`); serveren re-dirigerer slik at statiske filer serveres under base-path.

## Distribusjon/hosting
- Nettlify/tjener kan peke til `index.html` som statisk site; Express trengs kun hvis du vil lagre innsendinger server-side.
- For ren statikk: fjern/ignorer `server.js` og API-kall; forms lagres da kun i `localStorage`.

## Vedlikeholdstips
- Endre nedtellingen og tekst i `assets/js/app.js` (JAM_CONFIG).
- Oppdater base-path i `server.js` og i JS (`ASSET_BASE`) hvis du hoster på rot `/`.
- Sprites/lyd kan byttes i `assets/img` og `assets/sfx` med samme filnavn/format.

## Kjente avhengigheter/kanttilfeller
- LocalStorage kan feile i privat modus; da lagres bare på server hvis API svarer.
- Lyd starter først etter brukerinteraksjon (nettleserpolicy).
- Base-path må matche URL-en; ellers 404 på assets/API.
