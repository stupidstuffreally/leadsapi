import { PrismaClient } from "@prisma/client";

// Avoid exhausting the database connection limit by reusing a single
// PrismaClient instance across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
