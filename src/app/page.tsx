import { prisma } from "@/lib/prisma";
import { getLastSync } from "@/lib/data";

export const dynamic = "force-dynamic";

function scoreBadgeClass(score: number | null) {
  if (score === null) return "badge-neutral";
  if (score >= 8) return "badge-ok";
  if (score >= 6) return "badge-warn";
  return "badge-danger";
}

export default async function OverviewPage() {
  const [recentShifts, lastSync] = await Promise.all([
    prisma.shift.findMany({
      orderBy: { date: "desc" },
      take: 15,
      include: { recruiter: true },
    }),
    getLastSync(),
  ]);

  return (
    <>
      <h2>Week Cockpit</h2>
      <p className="subtitle">
        Per-shift inzicht per recruiter, met score en terugkoppeling.
        {lastSync
          ? ` Laatst bijgewerkt: ${lastSync.syncedAt.toLocaleString("nl-NL")}.`
          : " Nog geen data gesynchroniseerd vanuit Omni."}
      </p>

      {recentShifts.length === 0 ? (
        <div className="empty-state">
          Nog geen shifts geregistreerd. Vraag Claude om de laatste data uit
          Omni te halen zodra je klaar bent om te synchroniseren.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Recruiter</th>
              <th>Datum</th>
              <th>Score</th>
              <th>Terugkoppeling</th>
            </tr>
          </thead>
          <tbody>
            {recentShifts.map((shift) => (
              <tr key={shift.id}>
                <td>{shift.recruiter.name}</td>
                <td>{shift.date.toLocaleDateString("nl-NL")}</td>
                <td>
                  <span className={`badge ${scoreBadgeClass(shift.score)}`}>
                    {shift.score !== null ? shift.score.toFixed(1) : "—"}
                  </span>
                </td>
                <td className="feedback">{shift.feedback ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
