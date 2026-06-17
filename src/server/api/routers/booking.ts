import { TRPCError } from "@trpc/server";
import { createReservation } from "~/server/services/booking-service";
import { createBookingInputSchema } from "~/shared/reservation-schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const bookingRouter = createTRPCRouter({
  create: publicProcedure.input(createBookingInputSchema).mutation(async ({ input }) => {
    const result = await createReservation(input);
    if (result.ok) {
      return result.value;
    }
    throw new TRPCError({
      code: result.error.type === "SLOT_ALREADY_BOOKED" ? "CONFLICT" : "BAD_REQUEST",
      message: result.error.type === "SLOT_ALREADY_BOOKED" ? result.error.message : "予約を保存できませんでした",
    });
  }),
});
