import { PrismaClient } from "@prisma/client";
export * from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (!globalThis.prisma) {
  globalThis.prisma = new PrismaClient();
}

export const prisma = globalThis.prisma || new PrismaClient();

export const getPrismaClient = () => prisma;
