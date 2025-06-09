import { z } from "zod";

export const getMessagesDto = z.object({
	conversationId: z.string().uuid(),
});

export const createMessageDto = z.object({
	conversationId: z.string().uuid(),
	content: z.string().min(1),
});

export const createMessageStreamDto = z.object({
	conversationId: z.string().uuid(),
	content: z.string().min(1),
});

export type GetMessagesDto = z.infer<typeof getMessagesDto>;
export type CreateMessageDto = z.infer<typeof createMessageDto>;
export type CreateMessageStreamDto = z.infer<typeof createMessageStreamDto>;
