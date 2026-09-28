import { prisma } from "@/lib/prisma";
import {
  dateForDay,
  startOfDay,
  endOfDay,
  longLabel,
  getMondayOfWeek,
} from "@/lib/dates";

// SQLite has no native enum type, so Lead.status is a plain String column
// (see prisma/schema.prisma). This is the source of truth for which values
// are valid.
export type LeadStatus =
  | "NIEUW"
  | "GEBELD"
  | "INGEPLAND"
  | "GEINTERVIEWD"
  | "NIET_VERSCHENEN"
  | "AANGENOMEN"
  | "AFGEWEZEN";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NIEUW: "Nieuw",
  GEBELD: "Gebeld",
  INGEPLAND: "Gepland",
  GEINTERVIEWD: "Geïnterviewd",
  NIET_VERSCHENEN: "Niet verschenen",
  AANGENOMEN: "Aangenomen",
  AFGEWEZEN: "Afgewezen",
};

// The 5 columns shown on the Funnel-kanbanbord, in this exact order — matches
// the Design-canvas (Funnel.dc.html) 1-op-1. "Nieuw" (nog niet gebeld) en
// "Niet verschenen" (no-show) bestaan als status, maar hebben geen eigen kolom
// op dit bord.
export const FUNNEL_BOARD_STATUSES: LeadStatus[] = [
  "GEBELD",
  "INGEPLAND",
  "GEINTERVIEWD",
  "AANGENOMEN",
  "AFGEWEZEN",
];

// Mapping-regel voor de handmatige Omni-sync: een lead in Omni staat op
// "Geïnterviewd" zodra Omni voor die lead "uitkomst nodig" aangeeft (het
// gesprek heeft plaatsgevonden, maar er is nog geen aangenomen/afgewezen
// beslissing vastgelegd).

const OPEN_FUNNEL_STATUSES: LeadStatus[] = [
  "NIEUW",
  "GEBELD",
  "INGEPLAND",
  "GEINTERVIEWD",
  "NIET_VERSCHENEN",
];

// Looks up a lead's status label from a plain string (as it comes back
// from the database), falling back to the raw value for anything
// unexpected instead of erroring.
export function statusLabel(status: string): string {
  return LEAD_STATUS_LABELS[status as LeadStatus] ?? status;
}

// The full recruitment funnel: how many leads sit in each status right now.
export async function getFunnelCounts() {
  const counts = await prisma.lead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const byStatus = Object.fromEntries(
    Object.keys(LEAD_STATUS_LABELS).map((status) => [status, 0])
  ) as Record<LeadStatus, number>;

  for (const row of counts) {
    byStatus[row.status as LeadStatus] = row._count._all;
  }

  return byStatus;
}

// Rolling average score over a recruiter's most recent N shifts.
export async function getRollingAverage(recruiterId: string, take = 5) {
  const shifts = await prisma.shift.findMany({
    where: { recruiterId, score: { not: null } },
    orderBy: { date: "desc" },
    take,
  });

  if (shifts.length === 0) return null;

  const sum = shifts.reduce((acc, s) => acc + (s.score ?? 0), 0);
  return Math.round((sum / shifts.length) * 10) / 10;
}

// Every active recruiter with their rolling 5-shift average, for the
// overview list.
export async function getRecruitersWithRollingAverage(take = 5) {
  const recruiters = await prisma.recruiter.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return Promise.all(
    recruiters.map(async (r) => ({
      ...r,
      rollingAverage: await getRollingAverage(r.id, take),
    }))
  );
}

export async function getRecruiterDetail(id: string) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { id },
    include: {
      shifts: { orderBy: { date: "desc" } },
      evaluations: { orderBy: { date: "desc" } },
      leads: { orderBy: { receivedAt: "desc" } },
      coachingSessions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!recruiter) return null;

  return {
    ...recruiter,
    rollingAverage: await getRollingAverage(id),
    // Opmerkingen/focuspunten die vanaf het Dashboard bij deze recruiter
    // zijn toegevoegd, nieuwste eerst.
    focusPoints: recruiter.shifts
      .filter((s) => !!s.focusPoint)
      .sort((a, b) => b.date.getTime() - a.date.getTime()),
  };
}

export async function getLastSync() {
  return prisma.syncLog.findFirst({ orderBy: { syncedAt: "desc" } });
}

// ---------- Dashboard ----------

export async function getDashboardData(weekOffset: number, dayKey: string) {
  const date = dateForDay(weekOffset, dayKey);
  const weekStart = getMondayOfWeek(weekOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 5); // t/m zaterdag

  const [shifts, shiftsThisWeekCount, leadsInFunnelCount, aangenomenCount] =
    await Promise.all([
      prisma.shift.findMany({
        where: { date: { gte: startOfDay(date), lte: endOfDay(date) } },
        include: { recruiter: true },
        orderBy: { recruiter: { name: "asc" } },
      }),
      prisma.shift.count({
        where: { date: { gte: weekStart, lte: endOfDay(weekEnd) } },
      }),
      prisma.lead.count({ where: { status: { in: OPEN_FUNNEL_STATUSES } } }),
      prisma.lead.count({ where: { status: "AANGENOMEN" } }),
    ]);

  const scored = shifts.filter((s) => s.score !== null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          (scored.reduce((acc, s) => acc + (s.score ?? 0), 0) / scored.length) * 10
        ) / 10
      : null;

  return {
    date,
    dateLong: longLabel(dayKey, date),
    shifts,
    avgScore,
    shiftsThisWeekCount,
    leadsInFunnelCount,
    aangenomenCount,
  };
}

// ---------- Coaching & training ----------

export async function getCoachingData() {
  const [sessions, materials] = await Promise.all([
    prisma.coachingSession.findMany({
      include: { recruiter: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trainingMateriaal.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return {
    sessions,
    materials,
    countGepland: sessions.filter((s) => s.status === "gepland").length,
    countBehandeling: sessions.filter((s) => s.status === "in behandeling").length,
    countAfgerond: sessions.filter((s) => s.status === "afgerond").length,
  };
}

// ---------- Shifts ----------

export async function getShiftsDayData(dayKey: string) {
  const date = dateForDay(0, dayKey);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [shifts, leadsInRange, dayEvaluation, recruiters] = await Promise.all([
    prisma.shift.findMany({
      where: { date: { gte: dayStart, lte: dayEnd } },
      include: { recruiter: true },
    }),
    prisma.lead.findMany({
      where: { receivedAt: { gte: dayStart, lte: dayEnd } },
      include: { recruiter: true },
    }),
    prisma.dayEvaluation.findUnique({ where: { date: dayStart } }),
    prisma.recruiter.findMany({ where: { active: true } }),
  ]);

  const leadCountByRecruiter = new Map<string, number>();
  for (const lead of leadsInRange) {
    if (!lead.recruiterId) continue;
    leadCountByRecruiter.set(
      lead.recruiterId,
      (leadCountByRecruiter.get(lead.recruiterId) ?? 0) + 1
    );
  }

  const recruitersPresent = new Set<string>([
    ...shifts.map((s) => s.recruiterId),
    ...leadsInRange.filter((l) => l.recruiterId).map((l) => l.recruiterId as string),
  ]);

  const leadsPerRecruiter = recruiters
    .filter((r) => recruitersPresent.has(r.id))
    .map((r) => ({
      recruiter: r,
      count: leadCountByRecruiter.get(r.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const vestiging = recruiters.find((r) => r.vestiging)?.vestiging ?? null;

  return {
    date,
    dateLong: longLabel(dayKey, date),
    leadsPerRecruiter,
    totalLeads: leadsInRange.length,
    recruitersPresentCount: recruitersPresent.size,
    dayEvaluation,
    vestiging,
  };
}

// ---------- Visie ----------

export async function getGoals() {
  return prisma.doel.findMany({ orderBy: { order: "asc" } });
}

// ---------- Bestanden ----------

export async function getBestanden() {
  return prisma.bestand.findMany({ orderBy: { updatedAt: "desc" } });
}

// ---------- Recruiters overview (5-shift grid + trend) ----------

export type RecruiterOverviewRow = {
  id: string;
  name: string;
  vestiging: string | null;
  lastFive: (number | null)[]; // oldest -> newest, padded to length 5 with null
  rollingAverage: number | null;
  trend: "up" | "down" | "flat" | "new";
};

export async function getRecruitersOverview(): Promise<RecruiterOverviewRow[]> {
  const recruiters = await prisma.recruiter.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const rows = await Promise.all(
    recruiters.map(async (r) => {
      const shifts = await prisma.shift.findMany({
        where: { recruiterId: r.id, score: { not: null } },
        orderBy: { date: "desc" },
        take: 5,
      });
      const newestFirst = shifts.map((s) => s.score as number);
      const oldestFirst = [...newestFirst].reverse();
      const lastFive: (number | null)[] = Array(5 - oldestFirst.length)
        .fill(null)
        .concat(oldestFirst);

      const rollingAverage =
        newestFirst.length > 0
          ? Math.round((newestFirst.reduce((a, b) => a + b, 0) / newestFirst.length) * 10) / 10
          : null;

      let trend: RecruiterOverviewRow["trend"] = "flat";
      if (newestFirst.length < 5) {
        trend = "new";
      } else {
        const diff = oldestFirst[oldestFirst.length - 1] - oldestFirst[0];
        trend = diff > 0.3 ? "up" : diff < -0.3 ? "down" : "flat";
      }

      return {
        id: r.id,
        name: r.name,
        vestiging: r.vestiging,
        lastFive,
        rollingAverage,
        trend,
      };
    })
  );

  return rows.sort((a, b) => (b.rollingAverage ?? -1) - (a.rollingAverage ?? -1));
}

// ---------- Visie: aangenomen per maand ----------

const MAAND_LABELS = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

export async function getHiredPerMonth(monthsBack = 6) {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const hired = await prisma.lead.findMany({
    where: { status: "AANGENOMEN", updatedAt: { gte: rangeStart } },
    select: { updatedAt: true },
  });

  const buckets: { key: string; label: string; count: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MAAND_LABELS[d.getMonth()], count: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  for (const lead of hired) {
    const key = `${lead.updatedAt.getFullYear()}-${lead.updatedAt.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.count += 1;
  }

  return buckets;
}
