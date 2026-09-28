"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/dates";

// ---------- Dashboard: focuspunt per shift ----------

// Saves (or clears) the free-text "opmerking/focuspunt" for a recruiter's
// shift on a given date, added from the Dashboard's opmerking-knop. If no
// Shift row exists yet for that recruiter/date, one is created so the note
// has somewhere to live. Shows up on the recruiter's detail page under
// "Focuspunten (vanuit dashboard)".
export async function saveFocusPoint(
  recruiterId: string,
  date: Date,
  text: string
) {
  const trimmed = text.trim();
  const existing = await prisma.shift.findFirst({
    where: { recruiterId, date: { gte: startOfDay(date), lte: endOfDay(date) } },
  });

  if (existing) {
    await prisma.shift.update({
      where: { id: existing.id },
      data: { focusPoint: trimmed || null },
    });
  } else if (trimmed) {
    await prisma.shift.create({
      data: { recruiterId, date, focusPoint: trimmed },
    });
  }

  revalidatePath("/");
  revalidatePath(`/recruiters/${recruiterId}`);
}

// ---------- Shift-evaluatie toevoegen (Dashboard + Recruiter-detail) ----------

export async function addShiftEvaluation(
  recruiterId: string,
  date: Date,
  score: number,
  feedback: string
) {
  const trimmed = feedback.trim();
  if (!trimmed) return;

  const existing = await prisma.shift.findFirst({
    where: { recruiterId, date: { gte: startOfDay(date), lte: endOfDay(date) } },
  });

  if (existing) {
    await prisma.shift.update({
      where: { id: existing.id },
      data: { score, feedback: trimmed },
    });
  } else {
    await prisma.shift.create({
      data: { recruiterId, date, score, feedback: trimmed },
    });
  }

  revalidatePath("/");
  revalidatePath(`/recruiters/${recruiterId}`);
  revalidatePath("/recruiters");
}

// ---------- Coaching & training ----------

export async function addCoachingSession(
  recruiterId: string,
  title: string,
  dateLabel: string
) {
  const trimmed = title.trim();
  if (!trimmed) return;

  await prisma.coachingSession.create({
    data: {
      recruiterId,
      title: trimmed,
      meta: dateLabel.trim() ? `Gepland — ${dateLabel.trim()}` : "Gepland",
      status: "gepland",
    },
  });

  revalidatePath("/coaching");
  revalidatePath(`/recruiters/${recruiterId}`);
}

export async function toggleTrainingMateriaal(id: string, checked: boolean) {
  await prisma.trainingMateriaal.update({
    where: { id },
    data: { checked, checkedAt: checked ? new Date() : null },
  });
  revalidatePath("/coaching");
}

// ---------- Visie: doelen ----------

export async function saveDoel(
  id: string | null,
  name: string,
  current: number,
  target: number
) {
  const trimmed = name.trim();
  if (!trimmed) return;

  if (id) {
    await prisma.doel.update({
      where: { id },
      data: { name: trimmed, current, target },
    });
  } else {
    const count = await prisma.doel.count();
    await prisma.doel.create({
      data: { name: trimmed, current, target, order: count },
    });
  }

  revalidatePath("/visie");
}

// ---------- Bestanden ----------

const TEMPLATE_LABELS: Record<string, string> = {
  eval: "Evaluatie-template",
  rapport: "Vestigingsrapport",
  sollicitatie: "Sollicitatiegesprek — notities",
  leeg: "Leeg document",
};

export async function createBestand(templateType: string) {
  const label = TEMPLATE_LABELS[templateType] ?? "Nieuw document";
  await prisma.bestand.create({
    data: {
      name: `${label} — nieuw`,
      templateType,
      linked: templateType !== "leeg",
    },
  });
  revalidatePath("/bestanden");
}

// ---------- Shifts: dagevaluatie ----------

export async function saveDayEvaluation(date: Date, text: string) {
  const trimmed = text.trim();
  const day = startOfDay(date);

  await prisma.dayEvaluation.upsert({
    where: { date: day },
    update: { text: trimmed },
    create: { date: day, text: trimmed },
  });

  revalidatePath("/shifts");
}
