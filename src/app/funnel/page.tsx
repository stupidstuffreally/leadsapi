import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_LABELS, FUNNEL_BOARD_STATUSES, LeadStatus } from "@/lib/data";

export const dynamic = "force-dynamic";

const COLUMN_BADGE: Record<LeadStatus, string> = {
  NIEUW: "badge badge-neutral",
  GEBELD: "badge badge-neutral",
  INGEPLAND: "badge badge-neutral",
  GEINTERVIEWD: "badge badge-neutral",
  NIET_VERSCHENEN: "badge badge-warning",
  AANGENOMEN: "badge badge-success",
  AFGEWEZEN: "badge badge-danger",
};

export default async function FunnelPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { receivedAt: "desc" },
    take: 200,
    include: { recruiter: true },
  });

  const columns = FUNNEL_BOARD_STATUSES;
  const byStatus = Object.fromEntries(
    columns.map((status) => [status, leads.filter((l) => l.status === status)])
  ) as Record<LeadStatus, typeof leads>;

  return (
    <>
      <div>
        <h1>Leads funnel</h1>
        <div className="page-subtitle">
          Gebeld → Gepland → Geïnterviewd → Aangenomen of Afgewezen (met
          verplichte reden).
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(200px, 1fr))",
          gap: 16,
          alignItems: "start",
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {columns.map((status) => {
          const items = byStatus[status];
          return (
            <div key={status} className="glass" style={{ borderRadius: 22, padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 4px 14px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{LEAD_STATUS_LABELS[status]}</div>
                <span className={COLUMN_BADGE[status]}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--text-faint)", padding: "0 4px" }}>—</div>
                ) : (
                  items.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        background: "rgba(255,255,255,0.82)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        borderRadius: 16,
                        padding: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        boxShadow: "0 8px 20px -14px rgba(20,20,45,0.3)",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                        {lead.recruiter?.name ?? "Niet doorgestuurd"} ·{" "}
                        {lead.receivedAt.toLocaleDateString("nl-NL")}
                      </div>
                      {lead.note ? (
                        <div style={{ fontSize: 11, color: status === "AFGEWEZEN" ? "var(--danger-text)" : "var(--text-dim)" }}>
                          {status === "AFGEWEZEN" ? "Reden: " : ""}
                          {lead.note}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
