import Link from "next/link";
import { getRecruitersOverview } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { initials, avatarColor, scoreRingStyle } from "@/lib/avatar";
import AddEvaluationButton from "@/components/AddEvaluationButton";

export const dynamic = "force-dynamic";

const TREND_BADGE: Record<string, { text: string; className: string }> = {
  up: { text: "↑ stijgend", className: "badge badge-success" },
  down: { text: "↓ dalend", className: "badge badge-warning" },
  flat: { text: "stabiel", className: "badge badge-neutral" },
  new: { text: "nieuw", className: "badge badge-neutral" },
};

export default async function RecruitersPage() {
  const [rows, recruiters] = await Promise.all([
    getRecruitersOverview(),
    prisma.recruiter.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Recruiters</h1>
          <div className="page-subtitle">
            Rollend gemiddelde over de laatste vijf shifts, hoogste eerst.
          </div>
        </div>
        <AddEvaluationButton dateIso={new Date().toISOString()} recruiters={recruiters} />
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          Nog geen recruiters geregistreerd. Vraag Claude om de laatste data
          uit Omni te halen zodra je klaar bent om te synchroniseren.
        </div>
      ) : (
        <>
          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Vijf-shift overzicht</div>
            <div className="glass" style={{ borderRadius: 22, padding: 8 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.2fr repeat(5, 0.7fr) 0.9fr",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-faint)",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                <div>Recruiter</div>
                <div style={{ textAlign: "center" }}>1</div>
                <div style={{ textAlign: "center" }}>2</div>
                <div style={{ textAlign: "center" }}>3</div>
                <div style={{ textAlign: "center" }}>4</div>
                <div style={{ textAlign: "center" }}>5</div>
                <div style={{ textAlign: "right" }}>Gem. (5)</div>
              </div>

              {rows.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.2fr repeat(5, 0.7fr) 0.9fr",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderTop: "1px solid var(--border)",
                    background: i === 0 ? "rgba(10,132,255,0.06)" : undefined,
                    borderRadius: i === 0 ? 14 : undefined,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 600 }}>{r.name}</div>
                  {r.lastFive.map((score, idx) => (
                    <div key={idx} className="badge badge-neutral" style={{ justifyContent: "center" }}>
                      {score !== null ? score.toFixed(1) : "—"}
                    </div>
                  ))}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 15,
                      fontWeight: 700,
                      color: i === 0 ? "var(--accent)" : undefined,
                    }}
                  >
                    {r.rollingAverage !== null ? r.rollingAverage.toFixed(1) : "—"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8 }}>
              Kolom 1 = oudste van de laatste vijf shifts, kolom 5 = meest
              recent. Het gemiddelde loopt automatisch mee zodra er een
              nieuwe shift bijkomt.
            </div>
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Alle recruiters</div>
            <div className="glass list-card">
              {rows.map((r, i) => {
                const avatar = avatarColor(r.id);
                const trend = TREND_BADGE[r.trend];
                return (
                  <Link
                    key={r.id}
                    className="row-link"
                    href={`/recruiters/${r.id}`}
                    style={i < rows.length - 1 ? { borderBottom: "1px solid var(--border)" } : undefined}
                  >
                    <div className="avatar-chip" style={{ background: avatar.bg, color: avatar.color }}>
                      {initials(r.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-title">{r.name}</div>
                      <div className="row-meta">{r.vestiging ?? "Geen vestiging bekend"}</div>
                    </div>
                    <span className={trend.className}>{trend.text}</span>
                    <div className="score-ring" style={{ background: scoreRingStyle(r.rollingAverage), width: 48, height: 48 }}>
                      <div className="score-ring-inner" style={{ width: 38, height: 38 }}>
                        {r.rollingAverage !== null ? r.rollingAverage.toFixed(1) : "—"}
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)", flexShrink: 0 }}><path d="m9 5 7 7-7 7" /></svg>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
