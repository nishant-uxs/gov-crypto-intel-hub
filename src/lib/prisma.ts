import { PrismaClient } from "@prisma/client";

const defaultDatabaseUrl = "file:./prisma/dev.db";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
