// Day/week helpers for the Dashboard's dag- en weekselector and the
// Shifts screen's day picker. No external date library — the app only
// ever needs "which calendar date is day X of week-offset Y" and a
// couple of nl-NL labels.

export type DayDef = {
  key: string;
  label: string;
  jsDay: number; // 1 (ma) .. 6 (za), matches Date#getDay() for Mon-Sat
  long: string;
};

export const DAY_DEFS: DayDef[] = [
  { key: "ma", label: "ma", jsDay: 1, long: "maandag" },
  { key: "di", label: "di", jsDay: 2, long: "dinsdag" },
  { key: "wo", label: "wo", jsDay: 3, long: "woensdag" },
  { key: "do", label: "do", jsDay: 4, long: "donderdag" },
  { key: "vr", label: "vr", jsDay: 5, long: "vrijdag" },
  { key: "za", label: "za", jsDay: 6, long: "zaterdag" },
];

const MAANDEN = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

// Monday of the week `weekOffset` weeks ago (0 = this week, negative = back).
export function getMondayOfWeek(weekOffset: number): Date {
  const now = new Date();
  const day = now.getDay(); // 0 Sun .. 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() + diffToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function dateForDay(weekOffset: number, dayKey: string): Date {
  const def = DAY_DEFS.find((d) => d.key === dayKey) ?? DAY_DEFS[DAY_DEFS.length - 1];
  const monday = getMondayOfWeek(weekOffset);
  const d = new Date(monday);
  d.setDate(d.getDate() + (def.jsDay - 1));
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function shortLabel(date: Date): string {
  return `${date.getDate()} ${MAANDEN[date.getMonth()]}`;
}

export function longLabel(dayKey: string, date: Date): string {
  const def = DAY_DEFS.find((d) => d.key === dayKey);
  return `${def ? def.long : ""} ${date.getDate()} ${MAANDEN[date.getMonth()]}`.trim();
}

// Default day key for "no day chosen yet": today's weekday if it falls
// Mon-Sat, otherwise Saturday (the app doesn't model Sunday shifts).
export function defaultDayKey(): string {
  const jsDay = new Date().getDay();
  const found = DAY_DEFS.find((d) => d.jsDay === jsDay);
  return found ? found.key : "za";
}

export function isValidDayKey(key: string | undefined): key is string {
  return !!key && DAY_DEFS.some((d) => d.key === key);
}

export function weekLabel(weekOffset: number): string {
  if (weekOffset === 0) return "Deze week";
  const n = Math.abs(weekOffset);
  return `${n} ${n === 1 ? "week" : "weken"} geleden`;
}
