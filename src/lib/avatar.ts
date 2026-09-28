// Small presentational helpers shared by every screen that shows a
// recruiter as an avatar chip (Dashboard, Recruiters, Recruiter-detail,
// Shifts).

const PALETTE = [
  { bg: "rgba(10,132,255,0.12)", color: "#0a84ff" },
  { bg: "rgba(94,92,230,0.12)", color: "#5e5ce6" },
  { bg: "rgba(52,199,89,0.14)", color: "#1c7a34" },
  { bg: "rgba(255,159,10,0.14)", color: "#95610a" },
  { bg: "rgba(255,59,48,0.12)", color: "#b3261e" },
];

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function avatarColor(seed: string): { bg: string; color: string } {
  let hash = 0;
  for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function scoreBadge(score: number | null): { text: string; className: string } {
  if (score === null) return { text: "Nog geen score", className: "badge badge-neutral" };
  if (score >= 8) return { text: "Sterk", className: "badge badge-success" };
  if (score >= 6.5) return { text: "Solide", className: "badge badge-neutral" };
  if (score >= 5) return { text: "Aandacht nodig", className: "badge badge-warning" };
  return { text: "Extra coaching", className: "badge badge-danger" };
}

export function scoreRingStyle(score: number | null): string {
  const pct = score !== null ? Math.max(0, Math.min(100, Math.round(score * 10))) : 0;
  return `conic-gradient(#0a84ff 0% ${pct}%, rgba(120,120,128,0.16) ${pct}% 100%)`;
}
