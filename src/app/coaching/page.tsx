import { prisma } from "@/lib/prisma";
import { getCoachingData } from "@/lib/data";
import TrainingChecklist from "@/components/TrainingChecklist";
import ScheduleSessionButton from "@/components/ScheduleSessionButton";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  gepland: "badge badge-neutral",
  "in behandeling": "badge badge-warning",
  afgerond: "badge badge-success",
};

export default async function CoachingTrainingPage() {
  const [{ sessions, materials, countGepland, countBehandeling, countAfgerond }, recruiters] =
    await Promise.all([
      getCoachingData(),
      prisma.recruiter.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    ]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Coaching &amp; training</h1>
          <div className="page-subtitle">
            Alle coaching-sessies van het team op één plek, plus het
            trainingsmateriaal.
          </div>
        </div>
        <ScheduleSessionButton recruiters={recruiters} />
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="glass stat-tile">
          <div className="value">{countGepland}</div>
          <div className="label">Gepland</div>
        </div>
        <div className="glass stat-tile">
          <div className="value">{countBehandeling}</div>
          <div className="label">In behandeling</div>
        </div>
        <div className="glass stat-tile">
          <div className="value">{countAfgerond}</div>
          <div className="label">Afgerond</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-label">Coaching-sessies — alle recruiters</div>
          {sessions.length === 0 ? (
            <div className="empty-state">Nog geen coaching-sessies ingepland.</div>
          ) : (
            <div className="glass list-card">
              {sessions.map((s, i) => (
                <div
                  key={s.id}
                  className="row"
                  style={{
                    ...(i === sessions.length - 1 ? { borderBottom: "none" } : {}),
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="row-title">{s.title}</div>
                    <div className="row-meta">{s.recruiter.name} · {s.meta}</div>
                  </div>
                  <span className={STATUS_BADGE[s.status] ?? "badge badge-neutral"}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-label">Trainingsmateriaal</div>
          <TrainingChecklist materials={materials} />
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Vink af zodra een recruiter een module heeft afgerond — puur ter
            overzicht, dit is niet gekoppeld aan een dossier.
          </div>
        </div>
      </div>
    </>
  );
}
