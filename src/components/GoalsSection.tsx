"use client";

import { useState, useTransition } from "react";
import { saveDoel } from "@/lib/actions";

type Doel = {
  id: string;
  name: string;
  current: number;
  target: number;
};

export default function GoalsSection({ goals }: { goals: Doel[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [current, setCurrent] = useState("0");
  const [target, setTarget] = useState("1");
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditingId(null);
    setName("");
    setCurrent("0");
    setTarget("1");
    setOpen(true);
  }

  function openEdit(g: Doel) {
    setEditingId(g.id);
    setName(g.name);
    setCurrent(String(g.current));
    setTarget(String(g.target));
    setOpen(true);
  }

  function handleSave() {
    if (!name.trim()) {
      setOpen(false);
      return;
    }
    const currentNum = parseFloat(current) || 0;
    const targetNum = parseFloat(target) || 1;
    startTransition(async () => {
      await saveDoel(editingId, name, currentNum, targetNum);
      setOpen(false);
    });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="section-label">Doelen deze week</div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Doel toevoegen
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">Nog geen doelen toegevoegd.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          {goals.map((g) => {
            const pct = Math.max(4, Math.min(100, Math.round((g.current / (g.target || 1)) * 100)));
            return (
              <div key={g.id} className="glass" style={{ borderRadius: 22, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{g.name}</div>
                  <button type="button" className="icon-btn" onClick={() => openEdit(g)} aria-label="Doel bewerken">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                  </button>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{g.current} / {g.target}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}

      {open ? (
        <div className="modal-backdrop">
          <div className="modal-panel glass">
            <div className="modal-title">{editingId ? "Doel wijzigen" : "Doel toevoegen"}</div>
            <div>
              <div className="field-label">Doel</div>
              <input className="field-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. Man in dienst" />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="field-label">Huidige waarde</div>
                <input className="field-input" type="number" min={0} value={current} onChange={(e) => setCurrent(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="field-label">Doelwaarde</div>
                <input className="field-input" type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Annuleren</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={pending}>
                {pending ? "Opslaan…" : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
