import { z } from "zod";
import { listBookingsByStore } from "~/server/repositories/booking-repository";
import { storeRepository } from "~/server/repositories/store-repository";
import { createTRPCRouter, adminProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getStores: adminProcedure.query(() => storeRepository.listStores()),
  getBookingsByStore: adminProcedure
    .input(z.object({ storeId: z.string().min(1) }))
    .query(({ input }) => listBookingsByStore(input.storeId)),
});
