import { notFound } from "next/navigation";
import { getRecruiterDetail, statusLabel } from "@/lib/data";

export const dynamic = "force-dynamic";

function scoreBadgeClass(score: number | null) {
  if (score === null) return "badge-neutral";
  if (score >= 8) return "badge-ok";
  if (score >= 6) return "badge-warn";
  return "badge-danger";
}

export default async function RecruiterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const recruiter = await getRecruiterDetail(params.id);
  if (!recruiter) notFound();

  return (
    <>
      <h2>{recruiter.name}</h2>
      <p className="subtitle">
        {recruiter.vestiging ?? "Geen vestiging bekend"} · Rolling 5-shift
        gemiddelde:{" "}
        <span className={`badge ${scoreBadgeClass(recruiter.rollingAverage)}`}>
          {recruiter.rollingAverage !== null
            ? recruiter.rollingAverage.toFixed(1)
            : "—"}
        </span>
      </p>

      <div className="card">
        <h3>Per-shift performance</h3>
        {recruiter.shifts.length === 0 ? (
          <p className="feedback">Nog geen shifts geregistreerd.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Score</th>
                <th>Terugkoppeling</th>
              </tr>
            </thead>
            <tbody>
              {recruiter.shifts.map((s) => (
                <tr key={s.id}>
                  <td>{s.date.toLocaleDateString("nl-NL")}</td>
                  <td>
                    <span className={`badge ${scoreBadgeClass(s.score)}`}>
                      {s.score !== null ? s.score.toFixed(1) : "—"}
                    </span>
                  </td>
                  <td className="feedback">{s.feedback ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Evaluatie / coachingpunten</h3>
        {recruiter.evaluations.length === 0 ? (
          <p className="feedback">Nog geen evaluatiepunten geregistreerd.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Categorie</th>
                <th>Punt</th>
              </tr>
            </thead>
            <tbody>
              {recruiter.evaluations.map((e) => (
                <tr key={e.id}>
                  <td>{e.date.toLocaleDateString("nl-NL")}</td>
                  <td>{e.category ?? "—"}</td>
                  <td>{e.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Aangeleverde leads</h3>
        {recruiter.leads.length === 0 ? (
          <p className="feedback">Nog geen leads gekoppeld.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Naam</th>
                <th>Status</th>
                <th>Binnengekomen</th>
              </tr>
            </thead>
            <tbody>
              {recruiter.leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>
                    <span className="badge badge-neutral">
                      {statusLabel(l.status)}
                    </span>
                  </td>
                  <td>{l.receivedAt.toLocaleDateString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
