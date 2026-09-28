import { getGoals, getHiredPerMonth } from "@/lib/data";
import GoalsSection from "@/components/GoalsSection";

export const dynamic = "force-dynamic";

// Lange-termijndoelen van de vestiging: dit is vrije, vestigingsspecifieke
// tekst zonder een echte databron (net als in het Design-canvas zelf een
// placeholder) — Amy kan dit later invullen of laten koppelen aan een
// eigen model als dat gewenst is.
const TIMELINE = [
  { status: "behaald", badgeClass: "badge badge-success", period: "Q3 2026", title: "8 nieuwe recruiters aangenomen", dot: "#34c759" },
  { status: "bezig", badgeClass: "badge badge-info", period: "Q4 2026", title: "Team uitbreiden naar 12 recruiters", dot: "#0a84ff" },
  { status: "bezig", badgeClass: "badge badge-info", period: "Q4 2026", title: "Nieuwe standplaats openen", dot: "#0a84ff" },
  { status: "gepland", badgeClass: "badge badge-neutral", period: "Q1 2027", title: "Regiomanager aanstellen", dot: "#98989d" },
];

export default async function VisiePage() {
  const [goals, months] = await Promise.all([getGoals(), getHiredPerMonth(6)]);
  const maxCount = Math.max(1, ...months.map((m) => m.count));
  const totalHired = months.reduce((acc, m) => acc + m.count, 0);
  const strongestMonth = months.reduce((best, m) => (m.count > best.count ? m : best), months[0]);

  return (
    <>
      <div>
        <h1>Visie</h1>
        <div className="page-subtitle">
          Lange termijn doelen van de vestiging: waar staan we nu en waar
          willen we heen. [PLACEHOLDER — visietekst van de vestiging komt
          hier]
        </div>
      </div>

      <GoalsSection goals={goals} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div>
          <div className="section-label" style={{ marginBottom: 12 }}>Tijdlijn — lange termijn doelen</div>
          <div className="glass" style={{ borderRadius: 22, padding: "20px 20px 8px" }}>
            {TIMELINE.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="tl-dot" style={{ background: item.dot }} />
                  {i < TIMELINE.length - 1 ? <div className="tl-line" /> : null}
                </div>
                <div style={{ paddingBottom: i < TIMELINE.length - 1 ? 22 : 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={item.badgeClass}>{item.status}</span>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{item.period}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-label" style={{ marginBottom: 12 }}>Aangenomen per maand</div>
          <div className="glass card">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 160 }}>
              {months.map((m) => (
                <div key={m.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: m.key === strongestMonth?.key ? "var(--accent)" : "var(--text)" }}>
                    {m.count}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 34,
                      height: Math.max(4, Math.round((m.count / maxCount) * 140)),
                      background: "#0a84ff",
                      borderRadius: "6px 6px 2px 2px",
                    }}
                  />
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: m.key === strongestMonth?.key ? 600 : 400 }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: "var(--border-strong)", marginTop: 4 }} />
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 14 }}>
              {totalHired} aangenomen in de laatste {months.length} maanden
              {strongestMonth && strongestMonth.count > 0 ? ` — ${strongestMonth.label} is de sterkste maand tot nu toe.` : "."}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
