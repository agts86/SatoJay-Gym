import "server-only";

import { cookies } from "next/headers";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export async function api() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  return createCaller(createTRPCContext(new Request("http://localhost", { headers: { cookie: cookieHeader } })));
}
