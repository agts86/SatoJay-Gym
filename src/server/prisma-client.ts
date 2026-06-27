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
