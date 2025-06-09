import type { Session } from "@dialogue/auth/client";
import { initTRPC } from "@trpc/server";
import { AppError } from "./errors";

type Context = {
	session?: Session;
};

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw AppError.unauthorized("Authentication required");
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});
