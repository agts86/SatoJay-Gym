import { bookingRouter } from "~/server/api/routers/booking";
import { adminRouter } from "~/server/api/routers/admin";
import { storeRouter } from "~/server/api/routers/store";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  store: storeRouter,
  booking: bookingRouter,
  admin: adminRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
