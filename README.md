# HamarTech GameJam — bo-versjon (Netlify Forms)

Dette er en statisk GameJam-side med moderne animasjoner og ekte skjema via Netlify Forms.

## Det du MÅ endre (2 minutter)
Åpne `assets/js/app.js` og finn `CONFIG`:
- `submitDeadline`: sett riktig dato/tid i ISO-format, f.eks. `2025-11-22T18:00:00`
- `theme`: skriv inn tema (eller behold "annonseres ved oppstart")

## Deploy (anbefalt): Netlify (for ekte skjema)
1. Lag en GitHub-repo og last opp hele mappen.
2. Gå til Netlify → "Add new site" → "Import from Git".
3. Build settings:
   - Build command: (tom)
   - Publish directory: `.`
4. Etter deploy: Netlify → "Forms" (du vil se to skjema):
   - `gamejam-register`
   - `gamejam-submit`

### Tips
- Filopplasting i Netlify Forms kan ha begrensninger avhengig av plan. Lenke til itch.io/GitHub er anbefalt.
- Prosjektsiden (`projects.html`) viser data fra `assets/data/projects.json`.
  For å oppdatere prosjekter: rediger JSON-filen manuelt etter at jammen er ferdig.

## Lokal test
Bare åpne `index.html` i nettleser.
(Forms sendes ikke lokalt — de fungerer etter deploy på Netlify.)
