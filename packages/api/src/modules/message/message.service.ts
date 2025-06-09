import { type MessageTypeSelect, db, message } from "@dialogue/db";
import { and, eq } from "@dialogue/db";
import type {
	GetMessagesDto,
	SendMessageDto,
	StreamMessage,
} from "@dialogue/types";
import { AppError } from "../../errors";
import { llmService } from "../../lib";
import { redis } from "../../lib/redis";
import { conversationService } from "../conversation";

export class MessageService {
	async list(input: GetMessagesDto) {
		return db
			.select()
			.from(message)
			.where(and(eq(message.conversationId, input.conversationId)))
			.orderBy(message.createdAt);
	}

	async createMessages(
		conversationId: string,
		messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
		metadata: { provider: string; model: string },
	): Promise<MessageTypeSelect[]> {
		if (messages.length === 0) {
			return [];
		}

		const valuesToInsert = messages.map((msg) => ({
			conversationId,
			role: msg.role,
			content: msg.content,
			provider: metadata.provider,
			model: metadata.model,
		}));

		const newMessages = await db
			.insert(message)
			.values(valuesToInsert)
			.returning();

		if (newMessages.length !== messages.length) {
			throw AppError.badRequest("Failed to create all messages.");
		}

		return newMessages;
	}

	async send(input: SendMessageDto, userId: string) {
		let conversationId = input.conversationId;

		if (!conversationId) {
			const newConversation = await conversationService.create(userId);
			conversationId = newConversation.id;
			const conversationCreatedMessage: StreamMessage = {
				type: "conversation_created",
				conversationId,
			};
			await redis.publish(
				`conversation:${conversationId}`,
				JSON.stringify(conversationCreatedMessage),
			);
		} else {
			await conversationService.verifyAccess(conversationId, userId);
		}

		if (input.content && input.content.length > 0) {
			await this.createMessages(conversationId, input.content, {
				provider: input.provider,
				model: input.model,
			});
		}

		this._processAIResponseInBackground(conversationId, input).catch((err) => {
			console.error("Error in background AI processing:", err);
		});

		return { conversationId };
	}

	private async _processAIResponseInBackground(
		conversationId: string,
		input: SendMessageDto,
	) {
		const streamChannel = `conversation:${conversationId}`;

		try {
			const allMessages = await this.list({ conversationId });
			const coreMessages = allMessages
				.filter((msg) => msg.role !== "assistant" || msg.content)
				.map((msg) => ({
					role: msg.role as "user" | "assistant" | "system",
					content: msg.content,
				}));

			const result = await llmService.streamResponse(
				input.provider,
				input.model,
				coreMessages,
				{ apiKey: input.apiKey },
			);

			let aiResponse = "";

			for await (const chunk of result.textStream) {
				aiResponse += chunk;
				const streamMessage: StreamMessage = {
					type: "chunk",
					content: chunk,
				};
				await redis.publish(streamChannel, JSON.stringify(streamMessage));
			}

			if (aiResponse.trim()) {
				const [assistantMessage] = await this.createMessages(
					conversationId,
					[{ role: "assistant", content: aiResponse }],
					{
						provider: input.provider,
						model: input.model,
					},
				);

				const completeMessage: StreamMessage = {
					type: "complete",
					content: aiResponse,
					messageId: assistantMessage.id,
				};
				await redis.publish(streamChannel, JSON.stringify(completeMessage));
			} else {
				const errorMessage: StreamMessage = {
					type: "error",
					content: "No response generated from the AI provider.",
				};
				await redis.publish(streamChannel, JSON.stringify(errorMessage));
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("AI processing error:", error);

				let errorContent = "An error occurred while processing your request.";

				if (error?.message?.includes("API key")) {
					errorContent = `Invalid API key for ${input.provider} provider. Please check your API key.`;
				} else if (error?.message?.includes("model")) {
					errorContent = `Invalid model "${input.model}" for ${input.provider} provider.`;
				} else if (error?.message?.includes("rate limit")) {
					errorContent = `Rate limit exceeded for ${input.provider} provider. Please try again later.`;
				} else if (error?.message?.includes("quota")) {
					errorContent = `Quota exceeded for ${input.provider} provider. Please check your account.`;
				} else if (error?.message) {
					errorContent = `${input.provider} provider error: ${error.message}`;
				}

				const errorMessage: StreamMessage = {
					type: "error",
					content: errorContent,
				};
				await redis.publish(streamChannel, JSON.stringify(errorMessage));
			}
		}
	}
}

export const messageService = new MessageService();
