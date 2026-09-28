"use client";

import { useTransition } from "react";
import { createBestand } from "@/lib/actions";

export default function NewFileHeaderButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-primary"
      disabled={pending}
      onClick={() => startTransition(async () => { await createBestand("leeg"); })}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      {pending ? "Bezig…" : "Nieuw bestand"}
    </button>
  );
}
