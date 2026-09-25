# Leads API — Uphill

Dashboard voor het volgen van recruiter-leads (gebeld/ingepland/geïnterviewd/aangenomen)
bij Uphill, met data die handmatig wordt overgenomen vanuit
[omni.ventaesdirect.nl](https://omni.ventaesdirect.nl).

## Hoe de data werkt

Er is **geen automatische synchronisatie**. Data in dit project wordt alleen
bijgewerkt wanneer daar expliciet om gevraagd wordt — Claude leest dan de
laatste stand uit Omni en werkt de database hier bij, waarna de wijziging
gecommit en gepusht wordt.

## Datamodel (Prisma, zie `prisma/schema.prisma`)

- **Recruiter** — naam, vestiging, koppeling naar Omni.
- **Shift** — één shift per recruiter, met score en vrije terugkoppeling.
  De rolling 5-shift gemiddelde wordt berekend over de 5 meest recente shifts.
- **Lead** — een sollicitant, met status door de volledige funnel (nieuw →
  gebeld → ingepland → niet verschenen / aangenomen / afgewezen).
- **Evaluation** — coaching-/evaluatiepunten per recruiter, zichtbaar op het
  individuele recruiter-scherm.
- **SyncLog** — timestamp van de laatste handmatige sync.

## Database

De data staat in een gehoste Postgres-database ("Prisma Postgres", aangemaakt
via Vercel's Storage-tab en gekoppeld aan dit project). Er is dus geen
lokaal databasebestand meer dat gecommit moet worden — lokaal en live op
Vercel praten met dezelfde database, en schrijfacties (zoals de
schrijffunctie die later toegevoegd wordt) blijven gewoon bewaard tussen
deploys.

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

Dit project is al gekoppeld aan een Vercel-project (`leadsapi`) met een
Prisma Postgres-database erop aangesloten — de environment variables
(`POSTGRES_URL` e.a.) staan daar al goed. Vercel bouwt en deployt
automatisch bij elke push naar `main`.

## Pagina's

- `/` — Week Cockpit: recente shifts met score en terugkoppeling.
- `/funnel` — volledige leads-funnel met aantallen per status.
- `/recruiters` — alle recruiters met hun rolling 5-shift gemiddelde.
- `/recruiters/[id]` — individueel recruiter-scherm: per-shift performance,
  evaluatiepunten en aangeleverde leads.
