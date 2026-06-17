import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { adminSessionCookieName, verifySession } from "~/server/services/admin-auth-service";

export interface TRPCContext {
  isAdmin: boolean;
}

export function createTRPCContext(request?: Request): TRPCContext {
  const cookieHeader = request?.headers.get("cookie") ?? "";
  const cookieValue = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${adminSessionCookieName}=`))
    ?.split("=")[1];
  return { isAdmin: verifySession(cookieValue).ok };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
