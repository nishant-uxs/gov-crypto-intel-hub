import { PrismaClient } from "@prisma/client";

const defaultDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
