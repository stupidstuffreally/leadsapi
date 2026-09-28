import Link from "next/link";
import { DAY_DEFS } from "@/lib/dates";
import { getDashboardData, getLastSync } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import ShiftRow from "@/components/ShiftRow";
import AddEvaluationButton from "@/components/AddEvaluationButton";

export const dynamic = "force-dynamic";

function clampWeekOffset(raw: string | undefined): number {
  const n = raw ? parseInt(raw, 10) : 0;
  if (isNaN(n)) return 0;
  return Math.max(-3, Math.min(0, n));
}

function defaultDayForToday(): string {
  const jsDay = new Date().getDay();
  const found = DAY_DEFS.find((d) => d.jsDay === jsDay);
  return found ? found.key : "za";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { week?: string; day?: string };
}) {
  const weekOffset = clampWeekOffset(searchParams.week);
  const dayKey = DAY_DEFS.some((d) => d.key === searchParams.day)
    ? (searchParams.day as string)
    : defaultDayForToday();

  const [dashboard, lastSync, recruiters] = await Promise.all([
    getDashboardData(weekOffset, dayKey),
    getLastSync(),
    prisma.recruiter.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const prevWeek = Math.max(-3, weekOffset - 1);
  const nextWeek = Math.min(0, weekOffset + 1);
  const atOldest = weekOffset <= -3;
  const atNewest = weekOffset >= 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="page-subtitle">
            Recente shifts, per shift een score en terugkoppeling. Blader
            terug in dagen of weken om eerdere dashboards te bekijken.
            {lastSync
              ? ` Laatst gesynchroniseerd: ${lastSync.syncedAt.toLocaleString("nl-NL")}.`
              : " Nog geen data gesynchroniseerd vanuit Omni."}
          </div>
        </div>
        <AddEvaluationButton dateIso={dashboard.date.toISOString()} recruiters={recruiters} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className="week-nav">
          <Link
            href={`/?week=${prevWeek}&day=${dayKey}`}
            className={`icon-btn${atOldest ? " dim" : ""}`}
            aria-label="Vorige week"
            aria-disabled={atOldest}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
          </Link>
          <div className="week-label">{weekOffset === 0 ? "Deze week" : `${Math.abs(weekOffset)} ${Math.abs(weekOffset) === 1 ? "week" : "weken"} geleden`}</div>
          <Link
            href={`/?week=${nextWeek}&day=${dayKey}`}
            className={`icon-btn${atNewest ? " dim" : ""}`}
            aria-label="Volgende week"
            aria-disabled={atNewest}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
          </Link>
        </div>
        <div className="divider-v" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", padding: 2 }}>
          {DAY_DEFS.map((d) => (
            <Link
              key={d.key}
              href={`/?week=${weekOffset}&day=${d.key}`}
              className={`day-pill${d.key === dayKey ? " active" : ""}`}
            >
              <div>{d.label}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <div className="glass stat-tile">
          <div className="value">{dashboard.avgScore !== null ? dashboard.avgScore.toFixed(1) : "—"}</div>
          <div className="label">Gemiddelde score — {dashboard.dateLong}</div>
        </div>
        <div className="glass stat-tile">
          <div className="value">{dashboard.shiftsThisWeekCount}</div>
          <div className="label">Shifts deze week</div>
        </div>
        <div className="glass stat-tile">
          <div className="value">{dashboard.leadsInFunnelCount}</div>
          <div className="label">Leads in de funnel</div>
        </div>
        <div className="glass stat-tile">
          <div className="value">{dashboard.aangenomenCount}</div>
          <div className="label">Aangenomen</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-label">Shifts — {dashboard.dateLong}</div>
          <div className="glass list-card">
            {dashboard.shifts.length === 0 ? (
              <div className="empty-state">
                Geen shifts geregistreerd voor {dashboard.dateLong}.
              </div>
            ) : (
              dashboard.shifts.map((shift, i) => (
                <ShiftRow
                  key={shift.id}
                  recruiterId={shift.recruiterId}
                  recruiterName={shift.recruiter.name}
                  meta={`${shift.recruiter.vestiging ?? "Onbekende vestiging"} · ${dashboard.dateLong}`}
                  score={shift.score}
                  dateIso={dashboard.date.toISOString()}
                  initialNote={shift.focusPoint}
                  isLast={i === dashboard.shifts.length - 1}
                />
              ))
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-label">Snel naar</div>
          <div className="glass list-card">
            <Link className="row-link" href="/recruiters">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5c.6-3.3 3-5 5.5-5s4.9 1.7 5.5 5" /><circle cx="17" cy="9" r="2.6" /><path d="M15.8 14.3c2.1.3 3.9 1.8 4.4 4.5" /></svg>
              <div style={{ flex: 1 }}>
                <div className="row-title">Recruiters</div>
                <div className="row-meta">Vijf-shift gemiddelde per recruiter</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
            </Link>
            <Link className="row-link" href="/funnel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m14.8 9.2-1.9 5.6-5.6 1.9 1.9-5.6z" /></svg>
              <div style={{ flex: 1 }}>
                <div className="row-title">Leads funnel</div>
                <div className="row-meta">Van bellen tot aangenomen of afgewezen</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
