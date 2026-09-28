import { getBestanden } from "@/lib/data";
import TemplatePicker from "@/components/TemplatePicker";
import NewFileHeaderButton from "@/components/NewFileHeaderButton";

export const dynamic = "force-dynamic";

const TEMPLATE_COLORS: Record<string, string> = {
  eval: "#0a84ff",
  rapport: "#5e5ce6",
  sollicitatie: "#34c759",
  leeg: "#6e6e73",
};

export default async function BestandenPage() {
  const files = await getBestanden();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Bestanden</h1>
          <div className="page-subtitle">
            Alle documenten en evaluaties op één plek, gekoppeld aan Google
            Docs.
          </div>
        </div>
        <NewFileHeaderButton />
      </div>

      <TemplatePicker />

      <div>
        <div className="section-label" style={{ marginBottom: 12 }}>Alle bestanden</div>
        {files.length === 0 ? (
          <div className="empty-state">Nog geen bestanden aangemaakt.</div>
        ) : (
          <div className="glass list-card">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2.4fr 1fr 1fr 0.4fr",
                alignItems: "center",
                gap: 12,
                padding: "8px 16px",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-faint)",
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              <div>Naam</div>
              <div>Status</div>
              <div>Bewerkt</div>
              <div />
            </div>

            {files.map((f, i) => (
              <div
                key={f.id}
                className="row"
                style={i === files.length - 1 ? { borderBottom: "none" } : undefined}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEMPLATE_COLORS[f.templateType ?? "leeg"] ?? "#6e6e73"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{f.name}</div>
                </div>
                <span className={f.linked ? "badge badge-success" : "badge badge-neutral"} style={{ width: 130 }}>
                  {f.linked ? "● Gekoppeld · Docs" : "Niet gekoppeld"}
                </span>
                <div style={{ width: 150, fontSize: 12, color: "var(--text-dim)" }}>
                  {f.updatedAt.toLocaleDateString("nl-NL")}
                </div>
                {f.googleDocsUrl ? (
                  <a href={f.googleDocsUrl} target="_blank" rel="noreferrer" aria-label="Openen in Google Docs">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)" }}><path d="m9 5 7 7-7 7" /></svg>
                  </a>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)" }}><path d="m9 5 7 7-7 7" /></svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
