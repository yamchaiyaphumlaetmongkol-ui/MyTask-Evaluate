import { PrismaClient } from "@prisma/client";

/** เปลี่ยนค่านี้เมื่อแก้ prisma/schema.prisma แล้ว generate ใหม่ (dev จะสร้าง client ใหม่) */
const PRISMA_SCHEMA_GENERATION = "2025-pe-result-self-manager";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaGeneration?: string;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  const stale =
    globalForPrisma.prisma &&
    globalForPrisma.prismaGeneration !== PRISMA_SCHEMA_GENERATION;

  if (stale && globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaGeneration = PRISMA_SCHEMA_GENERATION;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
