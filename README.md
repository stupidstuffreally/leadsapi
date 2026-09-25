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
npm run db:push     # maakt de sqlite database aan volgens het schema
npm run db:seed      # optioneel: voorbeelddata
npm run dev
```

Open daarna http://localhost:3000.

## Live hosten (Vercel)

1. Ga naar [vercel.com](https://vercel.com), log in met je GitHub-account.
2. "Add New Project" → selecteer deze repo (`leadsapi`).
3. Zet de environment variable `DATABASE_URL`.
   - Voor een snelle start kan dat nog steeds een lokaal sqlite-bestand zijn,
     maar let op: op Vercel's serverless functies is de schijf niet
     persistent tussen deploys. Voor een dashboard waar het team live
     doorheen kijkt is een gehoste database (bv. Vercel Postgres, of een
     gehoste SQLite-variant zoals Turso) op termijn de betere keuze —
     zeker zodra er via de app zelf geschreven gaat worden (bijvoorbeeld
     als recruiters straks terugkoppeling direct in het dashboard typen).
4. Vercel bouwt en deployt automatisch bij elke push naar `main`.

## Pagina's

- `/` — Week Cockpit: recente shifts met score en terugkoppeling.
- `/funnel` — volledige leads-funnel met aantallen per status.
- `/recruiters` — alle recruiters met hun rolling 5-shift gemiddelde.
- `/recruiters/[id]` — individueel recruiter-scherm: per-shift performance,
  evaluatiepunten en aangeleverde leads.
