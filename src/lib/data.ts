import { prisma } from "@/lib/prisma";

// SQLite has no native enum type, so Lead.status is a plain String column
// (see prisma/schema.prisma). This is the source of truth for which values
// are valid.
export type LeadStatus =
  | "NIEUW"
  | "GEBELD"
  | "INGEPLAND"
  | "NIET_VERSCHENEN"
  | "AANGENOMEN"
  | "AFGEWEZEN";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NIEUW: "Nieuw",
  GEBELD: "Gebeld",
  INGEPLAND: "Ingepland",
  NIET_VERSCHENEN: "Niet verschenen",
  AANGENOMEN: "Aangenomen",
  AFGEWEZEN: "Afgewezen",
};

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
    },
  });

  if (!recruiter) return null;

  return {
    ...recruiter,
    rollingAverage: await getRollingAverage(id),
  };
}

export async function getLastSync() {
  return prisma.syncLog.findFirst({ orderBy: { syncedAt: "desc" } });
}
