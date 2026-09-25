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

## Lokaal draaien

```bash
npm install
cp .env.example .env
npm run db:push     # maakt prisma/data/dev.db aan volgens het schema
npm run db:seed     # vult de database met de laatste Omni-export
npm run dev
```

Open daarna http://localhost:3000.

Na `db:push`/`db:seed` staat er een echt databasebestand op
`prisma/data/dev.db`. Dit bestand wordt gewoon meegecommit (het staat niet
in `.gitignore`), want zonder dat bestand heeft de live site op Vercel
niets om te lezen:

```bash
git add prisma/data/dev.db
git commit -m "Databasebestand bijwerken"
git push
```

## Live hosten (Vercel)

1. Ga naar [vercel.com](https://vercel.com), log in met je GitHub-account.
2. "Add New Project" → selecteer deze repo (`leadsapi`).
3. Zet de environment variable `DATABASE_URL` op `file:./data/dev.db`.
   Let op: dit pad is relatief aan `prisma/schema.prisma`, dus niet
   `file:./prisma/data/dev.db` (dat zoekt dan verkeerd in `prisma/prisma/data/`).
   - Voor een snelle start werkt dit committed sqlite-bestand prima, maar
     let op: op Vercel's serverless functies is de schijf niet persistent
     tussen deploys — een write vanuit de live site zelf zou verloren gaan.
     Voor een dashboard waar het team live doorheen kijkt en later ook
     dingen invult, is een gehoste database (bv. Vercel Postgres, of een
     gehoste SQLite-variant zoals Turso) de betere keuze zodra die
     schrijffunctie er is.
4. Vercel bouwt en deployt automatisch bij elke push naar `main`.

## Pagina's

- `/` — Week Cockpit: recente shifts met score en terugkoppeling.
- `/funnel` — volledige leads-funnel met aantallen per status.
- `/recruiters` — alle recruiters met hun rolling 5-shift gemiddelde.
- `/recruiters/[id]` — individueel recruiter-scherm: per-shift performance,
  evaluatiepunten en aangeleverde leads.
