"use client";

import { useState, useTransition } from "react";
import { saveDayEvaluation } from "@/lib/actions";

export default function DayEvaluationEditor({
  dateIso,
  initialText,
}: {
  dateIso: string;
  initialText: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialText ?? "");
  const [text, setText] = useState(initialText ?? "");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await saveDayEvaluation(new Date(dateIso), draft);
      setText(draft.trim());
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <textarea
          className="field-textarea"
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Korte samenvatting van de dag — sfeer, drukte, wat opviel..."
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn" onClick={() => { setDraft(text); setEditing(false); }} disabled={pending}>
            Annuleren
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={pending}>
            {pending ? "Opslaan…" : "Opslaan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {text ? (
        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{text}</div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Nog geen dagevaluatie toegevoegd.</div>
      )}
      <button type="button" className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => setEditing(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        {text ? "Evaluatie bewerken" : "Evaluatie toevoegen"}
      </button>
    </div>
  );
}
