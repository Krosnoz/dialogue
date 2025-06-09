import { z } from "zod";

export const getMessagesDto = z.object({
	conversationId: z.string().uuid(),
});

export const sendMessageDto = z.object({
	conversationId: z.string().uuid().optional(),
	content: z.array(
		z.object({
			role: z.enum(["system", "user", "assistant"]),
			content: z.string().min(1),
		}),
	),
	provider: z.enum(["openai", "anthropic", "google"]).default("openai"),
	model: z.string().default("gpt-4o"),
	apiKey: z.string().optional(),
});

export const createConversationWithMessageDto = z.object({
	content: z.array(
		z.object({
			role: z.enum(["system", "user", "assistant"]),
			content: z.string().min(1),
		}),
	),
	provider: z.enum(["openai", "anthropic", "google"]).default("openai"),
	model: z.string().default("gpt-4o"),
	apiKey: z.string().optional(),
});

export type GetMessagesDto = z.infer<typeof getMessagesDto>;
export type SendMessageDto = z.infer<typeof sendMessageDto>;
export type CreateConversationWithMessageDto = z.infer<
	typeof createConversationWithMessageDto
>;
