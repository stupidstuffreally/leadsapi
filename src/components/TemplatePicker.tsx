"use client";

import { useState, useTransition } from "react";
import { createBestand } from "@/lib/actions";

const TEMPLATES = [
  { id: "eval", name: "Evaluatie-template", color: "#0a84ff" },
  { id: "rapport", name: "Vestigingsrapport", color: "#5e5ce6" },
  { id: "sollicitatie", name: "Sollicitatiegesprek — notities", color: "#34c759" },
  { id: "leeg", name: "Leeg document", color: "#6e6e73" },
];

export default function TemplatePicker() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? null;

  function handleCreate() {
    if (!selected) return;
    startTransition(async () => {
      await createBestand(selected.id);
      setSelectedId(null);
    });
  }

  return (
    <div>
      <div className="section-label" style={{ marginBottom: 12 }}>
        Kies een template <span style={{ textTransform: "none", fontWeight: 400, color: "var(--text-faint)" }}>— [PLACEHOLDER, templates volgen nog]</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tpl-card${selectedId === t.id ? " selected" : ""}`}
            style={selectedId === t.id ? { borderColor: t.color } : undefined}
            onClick={() => setSelectedId(t.id)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></svg>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Google Docs</div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="glass" style={{ borderRadius: 16, padding: "12px 16px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 13 }}>Geselecteerd: <strong>{selected.name}</strong></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn" onClick={() => setSelectedId(null)}>Annuleren</button>
            <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={pending}>
              {pending ? "Aanmaken…" : "Aanmaken"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
