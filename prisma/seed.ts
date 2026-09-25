/**
 * Import script — loads the most recent manual export from
 * prisma/data/omni-export-*.json and upserts it into the database.
 *
 * This project does NOT sync with Omni automatically. Data only gets
 * refreshed when Amy explicitly asks for it — at that point Claude reads
 * the latest state from omni.ventaesdirect.nl, writes a new dated export
 * file into prisma/data/, and this script loads it in.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type ExportLead = {
  omniId: string;
  name: string;
  phone: string | null;
  status: string;
  recruiterName: string | null;
  receivedAt: string | null;
  scheduledAt: string | null;
  note: string | null;
};

type ExportData = {
  syncedAt: string;
  source: string;
  recruiters: { id: string; name: string; vestiging: string }[];
  leads: ExportLead[];
};

function latestExportFile(): string {
  const dir = join(__dirname, "data");
  const files = readdirSync(dir)
    .filter((f) => f.startsWith("omni-export-") && f.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    throw new Error("Geen omni-export-*.json bestand gevonden in prisma/data/");
  }
  return join(dir, files[files.length - 1]);
}

async function main() {
  const file = latestExportFile();
  const data: ExportData = JSON.parse(readFileSync(file, "utf-8"));
  console.log(`Importeer ${file} (gesynchroniseerd: ${data.syncedAt})`);

  const recruiterIdByName = new Map<string, string>();

  for (const r of data.recruiters) {
    const recruiter = await prisma.recruiter.upsert({
      where: { omniId: r.id },
      update: { name: r.name, vestiging: r.vestiging },
      create: { name: r.name, omniId: r.id, vestiging: r.vestiging },
    });
    recruiterIdByName.set(r.name, recruiter.id);
  }

  let created = 0;
  let updated = 0;

  for (const lead of data.leads) {
    const recruiterId = lead.recruiterName
      ? recruiterIdByName.get(lead.recruiterName)
      : undefined;

    const existing = await prisma.lead.findFirst({
      where: { name: lead.name, receivedAt: new Date(lead.receivedAt ?? data.syncedAt) },
    });

    const payload = {
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      recruiterId: recruiterId ?? null,
      receivedAt: new Date(lead.receivedAt ?? data.syncedAt),
      scheduledAt: lead.scheduledAt ? new Date(lead.scheduledAt) : null,
      note: lead.note,
    };

    if (existing) {
      await prisma.lead.update({ where: { id: existing.id }, data: payload });
      updated++;
    } else {
      await prisma.lead.create({ data: payload });
      created++;
    }
  }

  await prisma.syncLog.create({
    data: { syncedAt: new Date(data.syncedAt), note: `Import uit ${file}` },
  });

  console.log(
    `Klaar: ${data.recruiters.length} recruiters, ${created} nieuwe leads, ${updated} bijgewerkte leads.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
