"use client";

import { useState, useTransition } from "react";
import { saveFocusPoint } from "@/lib/actions";
import { initials, avatarColor, scoreBadge, scoreRingStyle } from "@/lib/avatar";

type Props = {
  recruiterId: string;
  recruiterName: string;
  meta: string;
  score: number | null;
  dateIso: string;
  initialNote: string | null;
  isLast: boolean;
};

export default function ShiftRow({
  recruiterId,
  recruiterName,
  meta,
  score,
  dateIso,
  initialNote,
  isLast,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialNote ?? "");
  const [note, setNote] = useState(initialNote);
  const [pending, startTransition] = useTransition();
  const avatar = avatarColor(recruiterId);
  const badge = scoreBadge(score);

  function handleSave() {
    startTransition(async () => {
      await saveFocusPoint(recruiterId, new Date(dateIso), draft);
      setNote(draft.trim() || null);
      setOpen(false);
    });
  }

  return (
    <div style={!isLast ? { borderBottom: "1px solid var(--border)" } : undefined}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
        <div
          className="avatar-chip"
          style={{ background: avatar.bg, color: avatar.color }}
        >
          {initials(recruiterName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-title">{recruiterName}</div>
          <div className="row-meta">{meta}</div>
        </div>
        <span className={badge.className}>{badge.text}</span>
        <button
          type="button"
          className={`icon-btn${note ? " has-note" : ""}`}
          onClick={() => {
            setDraft(note ?? "");
            setOpen((o) => !o);
          }}
          aria-label="Opmerking toevoegen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 3z" /></svg>
        </button>
        <div className="score-ring" style={{ background: scoreRingStyle(score) }}>
          <div className="score-ring-inner">{score !== null ? score.toFixed(1) : "—"}</div>
        </div>
      </div>

      {!open && note ? <div className="note-line">Focuspunt: {note}</div> : null}

      {open ? (
        <div className="note-edit">
          <textarea
            className="field-textarea"
            rows={2}
            placeholder="Focuspunt naast de score, bijv. 'let op tempo bij afsluiting'..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-sm" onClick={() => setOpen(false)} disabled={pending}>
              Annuleren
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={pending}>
              {pending ? "Opslaan…" : "Opmerking opslaan"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
