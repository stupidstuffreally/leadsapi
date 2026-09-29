"use client";

import { useState, useTransition } from "react";
import { addCoachingSession } from "@/lib/actions";
import GlassSelect from "@/components/GlassSelect";

type RecruiterOption = { id: string; name: string };

export default function ScheduleSessionButton({ recruiters }: { recruiters: RecruiterOption[] }) {
  const [open, setOpen] = useState(false);
  const [recruiterId, setRecruiterId] = useState(recruiters[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [toast, setToast] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    if (!recruiterId || !title.trim()) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await addCoachingSession(recruiterId, title, dateLabel);
      setOpen(false);
      setTitle("");
      setDateLabel("");
      setToast(true);
      setTimeout(() => setToast(false), 2400);
    });
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)} disabled={recruiters.length === 0}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Sessie inplannen
      </button>

      {open ? (
        <div className="modal-backdrop">
          <div className="modal-panel glass">
            <div className="modal-title">Coaching-sessie inplannen</div>
            <div>
              <div className="field-label">Recruiter</div>
              <GlassSelect
                value={recruiterId}
                onChange={setRecruiterId}
                options={recruiters.map((r) => ({ value: r.id, label: r.name }))}
              />
            </div>
            <div>
              <div className="field-label">Onderwerp</div>
              <input
                className="field-input"
                type="text"
                placeholder="Bijv. Afsluittechnieken — module 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <div className="field-label">Datum</div>
              <input
                className="field-input"
                type="text"
                placeholder="Bijv. 3 okt"
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Annuleren</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={pending}>
                {pending ? "Inplannen…" : "Inplannen"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="toast">Sessie ingepland ✓</div> : null}
    </>
  );
}
