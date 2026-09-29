"use client";

import { useState, useTransition } from "react";
import { addShiftEvaluation } from "@/lib/actions";
import GlassSelect from "@/components/GlassSelect";

type RecruiterOption = { id: string; name: string };

type Props = {
  dateIso: string;
  recruiters?: RecruiterOption[]; // omit when the recruiter is fixed (detail page)
  fixedRecruiterId?: string;
  fixedRecruiterName?: string;
};

export default function AddEvaluationButton({
  dateIso,
  recruiters,
  fixedRecruiterId,
  fixedRecruiterName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [recruiterId, setRecruiterId] = useState(
    fixedRecruiterId ?? recruiters?.[0]?.id ?? ""
  );
  const [score, setScore] = useState("8");
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    if (!recruiterId || !feedback.trim()) {
      setOpen(false);
      return;
    }
    const scoreNum = parseFloat(score);
    startTransition(async () => {
      await addShiftEvaluation(
        recruiterId,
        new Date(dateIso),
        isNaN(scoreNum) ? 8 : scoreNum,
        feedback
      );
      setOpen(false);
      setFeedback("");
      setScore("8");
      setToast(true);
      setTimeout(() => setToast(false), 2400);
    });
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Evaluatie toevoegen
      </button>

      {open ? (
        <div className="modal-backdrop">
          <div className="modal-panel glass">
            <div className="modal-title">
              Evaluatie toevoegen{fixedRecruiterName ? ` — ${fixedRecruiterName}` : ""}
            </div>

            {recruiters ? (
              <div>
                <div className="field-label">Recruiter</div>
                <GlassSelect
                  value={recruiterId}
                  onChange={setRecruiterId}
                  options={recruiters.map((r) => ({ value: r.id, label: r.name }))}
                />
              </div>
            ) : null}

            <div>
              <div className="field-label">Score (0–10)</div>
              <input
                className="field-input"
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>

            <div>
              <div className="field-label">Terugkoppeling</div>
              <textarea
                className="field-textarea"
                rows={4}
                placeholder="Korte samenvatting van de shift..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Annuleren
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={pending}>
                {pending ? "Opslaan…" : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="toast">Evaluatie opgeslagen ✓</div> : null}
    </>
  );
}
