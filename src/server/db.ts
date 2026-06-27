import { createSatoJayPrismaClient, type SatoJayPrismaClient } from "~/server/prisma-client";

const globalForPrisma = globalThis as unknown as { prisma?: SatoJayPrismaClient };

export const db =
  globalForPrisma.prisma ??
  createSatoJayPrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
