import { publicProcedure, router } from "@dialogue/api/server";
import { conversationRouter } from "./modules/conversation";
import { messageRouter } from "./modules/message";
import { projectRouter } from "./modules/project";
import { providerRouter } from "./modules/provider";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	conversation: conversationRouter,
	provider: providerRouter,
	message: messageRouter,
	project: projectRouter,
});

export type AppRouter = typeof appRouter;
