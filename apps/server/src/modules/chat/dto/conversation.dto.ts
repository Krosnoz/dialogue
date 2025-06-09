import { z } from "zod";

export const createConversationDto = z.object({
	title: z.string().min(1).max(255),
});

export const conversationParamsDto = z.object({
	conversationId: z.string().uuid(),
});

export const deleteConversationDto = z.object({
	conversationId: z.string().uuid(),
});

export type CreateConversationDto = z.infer<typeof createConversationDto>;
export type ConversationParamsDto = z.infer<typeof conversationParamsDto>;
export type DeleteConversationDto = z.infer<typeof deleteConversationDto>;
