import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { chatSchema, db } from "../db";
import { protectedProcedure, router } from "../lib/trpc";

export const chatRouter = router({
	listConversations: protectedProcedure.query(async ({ ctx }) => {
		return await db
			.select()
			.from(chatSchema.conversations)
			.where(eq(chatSchema.conversations.userId, ctx.session.user.id))
			.orderBy(desc(chatSchema.conversations.updatedAt));
	}),

	createConversation: protectedProcedure
		.input(z.object({ title: z.string().min(1).max(255) }))
		.mutation(async ({ input, ctx }) => {
			const [conversation] = await db
				.insert(chatSchema.conversations)
				.values({
					userId: ctx.session.user.id,
					title: input.title,
				})
				.returning();

			return conversation;
		}),

	getMessages: protectedProcedure
		.input(z.object({ conversationId: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
			const conversation = await db
				.select()
				.from(chatSchema.conversations)
				.where(
					and(
						eq(chatSchema.conversations.id, input.conversationId),
						eq(chatSchema.conversations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!conversation.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}

			return await db
				.select()
				.from(chatSchema.messages)
				.where(eq(chatSchema.messages.conversationId, input.conversationId))
				.orderBy(chatSchema.messages.createdAt);
		}),

	createMessage: protectedProcedure
		.input(
			z.object({
				conversationId: z.string().uuid(),
				content: z.string().min(1),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const conversation = await db
				.select()
				.from(chatSchema.conversations)
				.where(
					and(
						eq(chatSchema.conversations.id, input.conversationId),
						eq(chatSchema.conversations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!conversation.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}

			const [userMessage] = await db
				.insert(chatSchema.messages)
				.values({
					conversationId: input.conversationId,
					role: "user",
					content: input.content,
				})
				.returning();

			const aiResponse = `Merci pour votre message: "${input.content}". Voici ma réponse simulée.`;

			const [assistantMessage] = await db
				.insert(chatSchema.messages)
				.values({
					conversationId: input.conversationId,
					role: "assistant",
					content: aiResponse,
				})
				.returning();

			await db
				.update(chatSchema.conversations)
				.set({ updatedAt: new Date() })
				.where(eq(chatSchema.conversations.id, input.conversationId));

			return {
				userMessage,
				assistantMessage,
			};
		}),

	createMessageStream: protectedProcedure
		.input(
			z.object({
				conversationId: z.string().uuid(),
				content: z.string().min(1),
			}),
		)
		.subscription(async ({ input, ctx }) => {
			return observable<{
				type: "user_message" | "ai_chunk" | "ai_complete";
				content: string;
				messageId?: string;
			}>((emit) => {
				(async () => {
					try {
						const conversation = await db
							.select()
							.from(chatSchema.conversations)
							.where(
								and(
									eq(chatSchema.conversations.id, input.conversationId),
									eq(chatSchema.conversations.userId, ctx.session.user.id),
								),
							)
							.limit(1);

						if (!conversation.length) {
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Conversation not found",
							});
						}

						const [userMessage] = await db
							.insert(chatSchema.messages)
							.values({
								conversationId: input.conversationId,
								role: "user",
								content: input.content,
							})
							.returning();

						emit.next({
							type: "user_message",
							content: userMessage.content,
							messageId: userMessage.id,
						});

						let aiResponse = "";
						const chunks = [
							"Je comprends votre question.",
							" Laissez-moi réfléchir à cela...",
							" Voici ma réponse détaillée :",
							" Cette solution devrait résoudre votre problème.",
						];

						for (const chunk of chunks) {
							await new Promise((resolve) => setTimeout(resolve, 500));
							aiResponse += chunk;
							emit.next({
								type: "ai_chunk",
								content: chunk,
							});
						}

						const [assistantMessage] = await db
							.insert(chatSchema.messages)
							.values({
								conversationId: input.conversationId,
								role: "assistant",
								content: aiResponse,
							})
							.returning();

						await db
							.update(chatSchema.conversations)
							.set({ updatedAt: new Date() })
							.where(eq(chatSchema.conversations.id, input.conversationId));

						emit.next({
							type: "ai_complete",
							content: aiResponse,
							messageId: assistantMessage.id,
						});

						emit.complete();
					} catch (error) {
						emit.error(
							error instanceof TRPCError
								? error
								: new TRPCError({
										code: "INTERNAL_SERVER_ERROR",
										message: "Failed to process message",
									}),
						);
					}
				})();
			});
		}),

	deleteConversation: protectedProcedure
		.input(z.object({ conversationId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const result = await db
				.delete(chatSchema.conversations)
				.where(
					and(
						eq(chatSchema.conversations.id, input.conversationId),
						eq(chatSchema.conversations.userId, ctx.session.user.id),
					),
				)
				.returning();

			if (!result.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Conversation not found",
				});
			}

			return { success: true };
		}),
});
