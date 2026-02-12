import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
export * from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function makePrismaClient() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing POSTGRES_URL (or DATABASE_URL) env var for Prisma Postgres adapter.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

if (!globalThis.prisma) {
  globalThis.prisma = makePrismaClient();
}

export const prisma = globalThis.prisma;

export const getPrismaClient = () => prisma;
