"use client";

import { useState, useTransition } from "react";
import { toggleTrainingMateriaal } from "@/lib/actions";

type Material = {
  id: string;
  title: string;
  description: string | null;
  checked: boolean;
};

export default function TrainingChecklist({ materials }: { materials: Material[] }) {
  const [localChecked, setLocalChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(materials.map((m) => [m.id, m.checked]))
  );
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    const next = !localChecked[id];
    setLocalChecked((prev) => ({ ...prev, [id]: next }));
    startTransition(async () => {
      await toggleTrainingMateriaal(id, next);
    });
  }

  if (materials.length === 0) {
    return <div className="empty-state">Nog geen trainingsmateriaal toegevoegd.</div>;
  }

  return (
    <div className="glass list-card">
      {materials.map((m) => {
        const checked = localChecked[m.id];
        return (
          <button key={m.id} type="button" className="check-row" onClick={() => toggle(m.id)}>
            <div className={`checkbox-box${checked ? " checked" : ""}`}>
              {checked ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              ) : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: checked ? "var(--text-faint)" : "var(--text)", textDecoration: checked ? "line-through" : "none" }}>
                {m.title}
              </div>
              {m.description ? (
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 1 }}>{m.description}</div>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
