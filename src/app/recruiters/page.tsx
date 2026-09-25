import Link from "next/link";
import { getRecruitersWithRollingAverage } from "@/lib/data";

export const dynamic = "force-dynamic";

function scoreBadgeClass(score: number | null) {
  if (score === null) return "badge-neutral";
  if (score >= 8) return "badge-ok";
  if (score >= 6) return "badge-warn";
  return "badge-danger";
}

export default async function RecruitersPage() {
  const recruiters = await getRecruitersWithRollingAverage();

  return (
    <>
      <h2>Recruiters</h2>
      <p className="subtitle">
        Rolling gemiddelde over de laatste 5 shifts per recruiter. Klik op
        een naam voor het volledige overzicht.
      </p>

      {recruiters.length === 0 ? (
        <div className="empty-state">
          Nog geen recruiters geregistreerd. Vraag Claude om de laatste data
          uit Omni te halen zodra je klaar bent om te synchroniseren.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Recruiter</th>
              <th>Vestiging</th>
              <th>Rolling 5-shift gemiddelde</th>
            </tr>
          </thead>
          <tbody>
            {recruiters.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/recruiters/${r.id}`}>{r.name}</Link>
                </td>
                <td>{r.vestiging ?? "—"}</td>
                <td>
                  <span
                    className={`badge ${scoreBadgeClass(r.rollingAverage)}`}
                  >
                    {r.rollingAverage !== null
                      ? r.rollingAverage.toFixed(1)
                      : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
