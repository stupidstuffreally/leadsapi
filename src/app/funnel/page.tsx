import { prisma } from "@/lib/prisma";
import { getFunnelCounts, LEAD_STATUS_LABELS } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function FunnelPage() {
  const [counts, leads] = await Promise.all([
    getFunnelCounts(),
    prisma.lead.findMany({
      orderBy: { receivedAt: "desc" },
      take: 50,
      include: { recruiter: true },
    }),
  ]);

  return (
    <>
      <h2>Leads funnel</h2>
      <p className="subtitle">
        Volledige follow-up funnel: gebeld, gepland, geïnterviewd/niet
        verschenen, aangenomen, afgewezen.
      </p>

      <div className="stat-row">
        {Object.entries(LEAD_STATUS_LABELS).map(([status, label]) => (
          <div className="stat-tile" key={status}>
            <div className="label">{label}</div>
            <div className="value">
              {counts[status as keyof typeof counts]}
            </div>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="empty-state">
          Nog geen leads geregistreerd. Vraag Claude om de laatste data uit
          Omni te halen zodra je klaar bent om te synchroniseren.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Status</th>
              <th>Recruiter</th>
              <th>Binnengekomen</th>
              <th>Opmerking</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>
                  <span className="badge badge-neutral">
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </td>
                <td>{lead.recruiter?.name ?? "Niet doorgestuurd"}</td>
                <td>{lead.receivedAt.toLocaleDateString("nl-NL")}</td>
                <td className="feedback">{lead.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
