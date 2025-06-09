import { on } from "node:events";
import { protectedProcedure, router } from "@dialogue/api/server";
import {
	type StreamMessage,
	getMessagesDto,
	sendMessageDto,
} from "@dialogue/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { redis } from "../../lib";
import { conversationService } from "../conversation";
import { messageService } from "./message.service";

export const messageRouter = router({
	list: protectedProcedure
		.input(getMessagesDto)
		.query(async ({ input, ctx }) => {
			await conversationService.verifyAccess(
				input.conversationId,
				ctx.session.user.id,
			);
			return messageService.list(input);
		}),

	send: protectedProcedure.input(sendMessageDto).mutation(({ input, ctx }) => {
		return messageService.send(input, ctx.session.user.id);
	}),

	onMessageUpdate: protectedProcedure
		.input(z.object({ conversationId: z.string() }))
		.subscription(async function* ({ input, signal }) {
			const sub = redis.duplicate();
			const channel = `conversation:${input.conversationId}`;

			const messageIterator = on(sub, "message", { signal });

			await sub.subscribe(channel);

			try {
				for await (const [ch, message] of messageIterator) {
					if (ch === channel) {
						try {
							const data = JSON.parse(message as string) as StreamMessage;
							yield data;
						} catch (e) {
							console.error(
								`Failed to parse message from Redis on channel ${channel}:`,
								e,
							);
						}
					}
				}
			} finally {
				await sub.unsubscribe(channel);
				sub.quit();
			}
		}),
});

export type MessageRouter = typeof messageRouter;
export type MessageInputs = inferRouterInputs<MessageRouter>;
export type MessageOutputs = inferRouterOutputs<MessageRouter>;
