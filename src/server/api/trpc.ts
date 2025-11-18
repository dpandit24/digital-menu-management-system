import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import type { NextRequest } from "next/server";

export type Context = {
	db: typeof db;
	userId: string | null;
	req?: NextRequest;
};

export async function createContext(_req?: NextRequest): Promise<Context> {
	const userId = await getSessionUserId().catch(() => null);
	return { db, userId, req: _req };
}

const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.userId) {
		throw new Error("UNAUTHORIZED");
	}
	return next({ ctx: { ...ctx, userId: ctx.userId } });
});

