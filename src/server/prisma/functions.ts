import type { Prisma } from "@prisma/client";
import { prisma } from "~/server/prisma/client";

export function withTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(callback);
}
