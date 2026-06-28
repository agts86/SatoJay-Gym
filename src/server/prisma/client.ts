import { PrismaClient } from "@prisma/client";

export type SatoJayPrismaClient = PrismaClient & {
  [Symbol.asyncDispose](): Promise<void>;
};

export function createSatoJayPrismaClient(...args: ConstructorParameters<typeof PrismaClient>): SatoJayPrismaClient {
  const client = new PrismaClient(...args);
  Object.defineProperty(client, Symbol.asyncDispose, {
    value: async () => {
      await client.$disconnect();
    },
  });
  return client as SatoJayPrismaClient;
}

const globalForPrisma = globalThis as unknown as { prisma?: SatoJayPrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  createSatoJayPrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
