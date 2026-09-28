# Leads API — Uphill

Dashboard voor het volgen van recruiter-leads (gebeld → ingepland → geïnterviewd →
aangenomen/afgewezen) en shift-scores bij Uphill Marketing (D2D sales). Brondata komt
uit [omni.ventaesdirect.nl](https://omni.ventaesdirect.nl) en wordt **niet automatisch**
gesynchroniseerd — alleen wanneer daar expliciet om gevraagd wordt.

## Status

- **Live op Vercel**, gekoppeld aan een Prisma Postgres-database.
- 4 van de 8 ontworpen schermen zijn gebouwd (zie hieronder). De overige 4
  (Coaching & training, Shifts, Visie, Bestanden) staan wel al volledig uitgewerkt
  in het ontwerp, maar nog niet in code.

## Ontwerp — bron van waarheid voor de UI

De actuele, levende versie van het ontwerp staat in een Claude Design-canvas, niet in
dit repo:

**https://claude.ai/artifact/HR8jH8H5UqQQcr9anfSWH4**

Dat canvas bevat alle 8 schermen als los doorklikbare pagina's, plus één
"Prototype — alles in één" artboard dat ze allemaal met vloeiende overgangs-animaties
combineert (handig om het hele klikpad in één keer te doorlopen). Gebruik dit canvas
als spec voor exacte lay-out, spacing, kleuren en interactie — niet de `/wireframe`
map in dit repo, die is een oudere, statische snapshot van vóór de laatste
ontwerpronde en wordt niet meer bijgewerkt.

Design-taal in het kort: iOS-liquid-glass stijl (`backdrop-filter: blur(28px)
saturate(180%)`), font-stack `-apple-system`, accentkleur `#0A84FF` (instelbaar),
secundair `#5E5CE6`, status-kleuren groen `#34C759` / oranje `#FF9F0A` / rood
`#FF3B30`. Score-ringen zijn `conic-gradient`s, iconen zijn inline stroke-SVG's
(geen emoji). Leads-per-recruiter kleurt: 3+ leads groen, 2 leads geel, 0–1 rood.

## Alle 8 schermen

| # | Scherm | Route (gebouwd) | Status |
|---|---|---|---|
| 1 | **Dashboard** — recente shifts per dag met score + terugkoppeling, een "opmerking"-knop per shift voor vrije focuspunten naast de score, een dag-selector én een week-terugblader (tot 3 weken terug) | `/` | Gebouwd (basisversie; dag/week-selector en per-shift opmerkingen staan in het ontwerp, nog niet in code) |
| 2 | **Leads funnel** — Gebeld → Gepland → Geïnterviewd → Aangenomen/Afgewezen (met verplichte reden) | `/funnel` | Gebouwd |
| 3 | **Recruiters** — rollend 5-shift gemiddelde per recruiter, hoogste eerst | `/recruiters` | Gebouwd |
| 4 | **Recruiter detail** — score per shift, evaluaties, coaching-historie, en (in het ontwerp) een "Focuspunten (vanuit dashboard)"-sectie die de opmerkingen toont die vanaf het Dashboard bij die recruiter zijn genoteerd | `/recruiters/[id]` | Gebouwd (focuspunten-koppeling nog niet) |
| 5 | **Coaching & training** — alle coaching-sessies van het team op één plek (sessie inplannen, per recruiter), plus een afvinkbare lijst trainingsmateriaal | — | Nog te bouwen |
| 6 | **Shifts** — per dag: leads per recruiter, locatie, en een dagevaluatie/consensus | — | Nog te bouwen |
| 7 | **Visie** — lange-termijndoelen van de vestiging, met voortgangsbalken en een tijdlijn | — | Nog te bouwen |
| 8 | **Bestanden** — alle documenten/evaluaties op één plek, met een template-kiezer, gekoppeld aan Google Docs | — | Nog te bouwen |

Navigatievolgorde in de sidebar: Dashboard, Leads funnel, Recruiters, Coaching &
training, Shifts, Visie, Bestanden.

## Hoe de data werkt

Er is **geen automatische synchronisatie**. Data in dit project wordt alleen
bijgewerkt wanneer daar expliciet om gevraagd wordt — Claude leest dan de laatste
stand uit Omni en werkt de database hier bij, waarna de wijziging gecommit en
gepusht wordt.

## Datamodel (Prisma, zie `prisma/schema.prisma`)

Gebouwd:
- **Recruiter** — naam, vestiging, koppeling naar Omni.
- **Shift** — één shift per recruiter, met score en vrije terugkoppeling. Het
  rollend 5-shift gemiddelde wordt berekend over de 5 meest recente shifts.
- **Lead** — een sollicitant, met status door de volledige funnel (nieuw → gebeld →
  ingepland → niet verschenen / aangenomen / afgewezen).
- **Evaluation** — coaching-/evaluatiepunten per recruiter, zichtbaar op het
  individuele recruiter-scherm.
- **SyncLog** — timestamp van de laatste handmatige sync.

Nog te modelleren (voor de 4 nieuwe schermen):
- Vrije opmerking/focuspunt per `Shift` (los van de bestaande `feedback`-tekst, of
  daarop uitgebreid) — gekoppeld aan de recruiter zodat scherm 4 ze kan tonen.
- **CoachingSession** — recruiter, onderwerp, datum, status (gepland / in
  behandeling / afgerond).
- **TrainingMateriaal** — titel, omschrijving, per-recruiter afgevinkt of niet.
- **Doel** (Visie) — naam, huidige waarde, doelwaarde, periode.
- **Bestand** — naam, template-type, gekoppelde Google Docs-link, gekoppeld/niet
  gekoppeld.

## Database

De data staat in een gehoste Postgres-database ("Prisma Postgres", aangemaakt via
Vercel's Storage-tab en gekoppeld aan dit project). Er is dus geen lokaal
databasebestand dat gecommit moet worden — lokaal en live op Vercel praten met
dezelfde database, en schrijfacties blijven gewoon bewaard tussen deploys.

## Lokaal draaien

```bash
npm install
npx vercel link          # koppelt deze map aan het Vercel-project (eenmalig)
npx vercel env pull .env # haalt de echte POSTGRES_URL op uit Vercel
npm run db:push          # zet het schema op de database
npm run db:seed          # vult de database met de laatste Omni-export
npm run dev
```

Open daarna http://localhost:3000.

## Live hosten (Vercel)

Dit project is al gekoppeld aan een Vercel-project (`leadsapi`) met een Prisma
Postgres-database erop aangesloten — de environment variables (`POSTGRES_URL` e.a.)
staan daar al goed. Vercel bouwt en deployt automatisch bij elke push naar `main`.

## Volgende stappen

Om vanuit dit repo verder te bouwen: neem het Design-canvas hierboven als exacte
spec, breid `prisma/schema.prisma` uit met de vier ontbrekende modellen, en bouw de
vier ontbrekende routes (`/coaching`, `/shifts`, `/visie`, `/bestanden`) plus de
dag/week-selector en de focuspunten-koppeling op het Dashboard en het
Recruiter-detailscherm.
