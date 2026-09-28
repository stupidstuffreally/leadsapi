import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecruiterDetail, statusLabel } from "@/lib/data";
import { initials, avatarColor, scoreRingStyle } from "@/lib/avatar";
import AddEvaluationButton from "@/components/AddEvaluationButton";

export const dynamic = "force-dynamic";

const COACHING_BADGE: Record<string, string> = {
  gepland: "badge badge-neutral",
  "in behandeling": "badge badge-warning",
  afgerond: "badge badge-success",
};

export default async function RecruiterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const recruiter = await getRecruiterDetail(params.id);
  if (!recruiter) notFound();

  const avatar = avatarColor(recruiter.id);
  const shiftRing = [...recruiter.shifts]
    .filter((s) => s.score !== null)
    .slice(0, 5)
    .reverse();

  return (
    <>
      <Link className="back-link" href="/recruiters">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5 8 12l7 7" /></svg>
        Alle recruiters
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            className="avatar-chip"
            style={{ width: 56, height: 56, borderRadius: 16, fontSize: 17, background: avatar.bg, color: avatar.color }}
          >
            {initials(recruiter.name)}
          </div>
          <div>
            <h1 style={{ fontSize: 24 }}>{recruiter.name}</h1>
            <div style={{ marginTop: 4, fontSize: 13, color: "var(--text-dim)" }}>
              {recruiter.vestiging ?? "Geen vestiging bekend"} · Gemiddelde
              laatste vijf shifts:{" "}
              <strong style={{ color: "var(--text)" }}>
                {recruiter.rollingAverage !== null ? recruiter.rollingAverage.toFixed(1) : "—"}
              </strong>
            </div>
          </div>
        </div>
        <AddEvaluationButton
          dateIso={new Date().toISOString()}
          fixedRecruiterId={recruiter.id}
          fixedRecruiterName={recruiter.name}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Score per shift</div>
            {shiftRing.length === 0 ? (
              <div className="empty-state">Nog geen shifts met score.</div>
            ) : (
              <div className="glass card" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                {shiftRing.map((s) => (
                  <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div className="score-ring" style={{ background: scoreRingStyle(s.score) }}>
                      <div className="score-ring-inner">{s.score?.toFixed(1)}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                      {s.date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Focuspunten (vanuit dashboard)</div>
            {recruiter.focusPoints.length === 0 ? (
              <div className="empty-state">Nog geen focuspunten toegevoegd vanaf het Dashboard.</div>
            ) : (
              <div className="glass list-card">
                {recruiter.focusPoints.map((s, i) => (
                  <div key={s.id} className="row" style={i === recruiter.focusPoints.length - 1 ? { borderBottom: "none" } : undefined}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{s.focusPoint}</div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
                        {s.date.toLocaleDateString("nl-NL")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Evaluaties</div>
            {recruiter.evaluations.length === 0 ? (
              <div className="empty-state">Nog geen evaluatiepunten geregistreerd.</div>
            ) : (
              <div className="glass list-card">
                {recruiter.evaluations.map((ev, i) => (
                  <div key={ev.id} className="row" style={{ display: "block" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div className="row-title">{ev.category ?? "Evaluatie"} — {ev.date.toLocaleDateString("nl-NL")}</div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{ev.point}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Aangeleverde leads</div>
            {recruiter.leads.length === 0 ? (
              <div className="empty-state">Nog geen leads gekoppeld.</div>
            ) : (
              <div className="glass list-card">
                {recruiter.leads.map((l, i) => (
                  <div key={l.id} className="row" style={i === recruiter.leads.length - 1 ? { borderBottom: "none" } : undefined}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row-title">{l.name}</div>
                      <div className="row-meta">{l.receivedAt.toLocaleDateString("nl-NL")}</div>
                    </div>
                    <span className="badge badge-neutral">{statusLabel(l.status)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="section-label" style={{ marginBottom: 12 }}>Coaching &amp; training</div>
          {recruiter.coachingSessions.length === 0 ? (
            <div className="empty-state">Nog geen coaching ingepland.</div>
          ) : (
            <div className="glass list-card">
              {recruiter.coachingSessions.map((c, i) => (
                <div
                  key={c.id}
                  className="row"
                  style={{
                    ...(i === recruiter.coachingSessions.length - 1 ? { borderBottom: "none" } : {}),
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div className="row-title">{c.title}</div>
                    <div className="row-meta">{c.meta ?? ""}</div>
                  </div>
                  <span className={COACHING_BADGE[c.status] ?? "badge badge-neutral"}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
