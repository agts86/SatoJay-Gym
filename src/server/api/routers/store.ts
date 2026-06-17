import { z } from "zod";
import { storeRepository } from "~/server/repositories/store-repository";
import { listVisibleSlots } from "~/server/services/availability-service";
import { KANTO_PREFECTURES } from "~/shared/reservation-types";
import { createTRPCRouter, publicProcedure } from "../trpc";

const prefectureSchema = z.enum(KANTO_PREFECTURES);

export const storeRouter = createTRPCRouter({
  getPrefectures: publicProcedure.query(() => storeRepository.listPrefectures()),
  getStoresByPrefecture: publicProcedure
    .input(z.object({ prefecture: prefectureSchema }))
    .query(({ input }) => storeRepository.listStoresByPrefecture(input.prefecture)),
  getAvailability: publicProcedure
    .input(z.object({ storeId: z.string().min(1) }))
    .query(({ input }) => listVisibleSlots(input.storeId)),
});
