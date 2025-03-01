import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export * from "@prisma/client"

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;


// const globalForPrisma = global as unknown as { prisma: PrismaClie };

// export const prisma = globalForPrisma.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export * from "../prisma/generated/client";