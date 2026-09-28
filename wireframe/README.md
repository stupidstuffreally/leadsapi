# Leads API — wireframe/opmaak

Statische, clickable wireframe van de Leads API in de glass-stijl (iOS Liquid Glass / macOS-achtig). Geen build-tool of server nodig — gewoon `index.html` openen in de browser.

## Pagina's

- `index.html` — Dashboard: recente shifts met score + terugkoppeling
- `recruiters.html` — Recruiters: rollend vijf-shift gemiddelde
- `recruiter.html?id=<naam>` — Recruiter detailpagina: score per shift, evaluaties, coaching
- `funnel.html` — Leads funnel: gebeld → gepland → geïnterviewd → aangenomen/afgewezen

De schrijffunctie (evaluatie toevoegen) zit als knop/FAB op het dashboard en de recruiter-detailpagina. De "Document aanmaken via Google Docs"-knop in dat formulier is nu nog een placeholder — de echte Google Docs-koppeling komt bij de database-integratie.

## Data

Alle data in `app.js` is mock-data (in het geheugen van de pagina), zodat je meteen door de pagina's kan klikken. Niets hiervan raakt de echte database of de Next.js-app in `~/Projects/leadsapi`.

## Status

Onderdeel van de stap "Wireframe" + "opmaak" uit het Leads API-takenoverzicht, voorafgaand aan de GitHub- en database-integratie. Zie het document "Leads API — Functionaliteiten & User Cards" voor de volledige functionaliteitsbeschrijving per pagina.
