/**
 * Manual seed / import script.
 *
 * This project does NOT sync with Omni automatically. Data only gets
 * refreshed when Amy explicitly asks for it — at that point the latest
 * data read from omni.ventaesdirect.nl is written in here (or in a
 * generated import file this script reads) and committed to the repo.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Example shape for one recruiter with a shift, a lead and an
  // evaluation point. Replace/extend this with real data on each sync.
  const recruiter = await prisma.recruiter.upsert({
    where: { omniId: "example-omni-id" },
    update: {},
    create: {
      name: "Voorbeeld Recruiter",
      omniId: "example-omni-id",
      vestiging: "Leeuwarden Oost",
    },
  });

  await prisma.shift.create({
    data: {
      recruiterId: recruiter.id,
      date: new Date(),
      score: 8.5,
      feedback: "Goede opvolging van leads, blijft vriendelijk aan de deur.",
    },
  });

  await prisma.syncLog.create({
    data: { note: "Voorbeeld seed — vervang door echte data uit Omni." },
  });

  console.log("Seed voltooid.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
