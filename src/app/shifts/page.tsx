import Link from "next/link";
import { DAY_DEFS, defaultDayKey } from "@/lib/dates";
import { getShiftsDayData } from "@/lib/data";
import { initials, avatarColor } from "@/lib/avatar";
import DayEvaluationEditor from "@/components/DayEvaluationEditor";

export const dynamic = "force-dynamic";

function barColor(count: number) {
  if (count >= 3) return "#34c759";
  if (count === 2) return "#ff9f0a";
  return "#ff3b30";
}

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: { day?: string };
}) {
  const dayKey = DAY_DEFS.some((d) => d.key === searchParams.day)
    ? (searchParams.day as string)
    : defaultDayKey();

  const data = await getShiftsDayData(dayKey);
  const maxCount = Math.max(1, ...data.leadsPerRecruiter.map((p) => p.count));

  return (
    <>
      <div>
        <h1>Shifts</h1>
        <div className="page-subtitle">
          Per dag: geleverde leads, locatie, wie er stond en de dagevaluatie.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, overflowX: "auto", padding: "4px 2px" }}>
        {DAY_DEFS.map((d) => (
          <Link key={d.key} href={`/shifts?day=${d.key}`} className={`day-pill${d.key === dayKey ? " active" : ""}`}>
            <div>{d.label}</div>
          </Link>
        ))}
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="glass stat-tile">
          <div className="value">{data.totalLeads}</div>
          <div className="label">Leads gehaald — {data.dateLong}</div>
        </div>
        <div className="glass stat-tile">
          <div className="value">{data.recruitersPresentCount}</div>
          <div className="label">Recruiters aanwezig</div>
        </div>
        <div className="glass stat-tile">
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></svg>
            {data.vestiging ?? "Onbekend"}
          </div>
          <div className="label">Locatie</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-label">Leads per recruiter</div>
          {data.leadsPerRecruiter.length === 0 ? (
            <div className="empty-state">Geen shifts of leads voor {data.dateLong}.</div>
          ) : (
            <div className="glass list-card">
              {data.leadsPerRecruiter.map((p, i) => {
                const avatar = avatarColor(p.recruiter.id);
                const color = barColor(p.count);
                const pct = Math.max(8, Math.round((p.count / maxCount) * 100));
                return (
                  <div
                    key={p.recruiter.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      borderBottom: i === data.leadsPerRecruiter.length - 1 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <div className="avatar-chip" style={{ width: 36, height: 36, fontSize: 13, background: avatar.bg, color: avatar.color }}>
                      {initials(p.recruiter.name)}
                    </div>
                    <div style={{ width: 130, fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{p.recruiter.name}</div>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(60,60,67,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: color }} />
                    </div>
                    <div style={{ width: 28, textAlign: "right", fontSize: 14, fontWeight: 700, color }}>{p.count}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Groen = 3 of meer leads · geel = 2 leads · rood = 0 of 1 lead.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Dagevaluatie — algemene consensus</div>
            <div className="glass card">
              <DayEvaluationEditor dateIso={data.date.toISOString()} initialText={data.dayEvaluation?.text ?? null} />
            </div>
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Locatie</div>
            <div className="glass card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{data.vestiging ?? "Onbekende vestiging"}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                  Locatie komt uit het vestiging-veld van de recruiters.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
