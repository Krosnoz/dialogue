import { conversation, db, eq, message } from "@dialogue/db";
import { type Job, Worker } from "bullmq";
import { type ChatMessage, chatService } from "../lib/ai/chat.service";
import { generateEmbedding } from "../lib/ai/embedding.service";
import redis from "../lib/redis";

const worker = new Worker(
	"chat-queue",
	async (job: Job) => {
		const { conversationId, content } = job.data;
		const publisher = redis.duplicate();
		const channel = `chat:${conversationId}`;

		try {
			// Get conversation history for context
			const conversationHistory = await db
				.select()
				.from(message)
				.where(eq(message.conversationId, conversationId))
				.orderBy(message.createdAt);

			// Build messages array for OpenAI
			const messages: ChatMessage[] = [
				{
					role: "system",
					content:
						"You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
				},
				...conversationHistory.map(
					(msg): ChatMessage => ({
						role: msg.role as "user" | "assistant",
						content: msg.content,
					}),
				),
			];

			let aiResponse = "";

			// Stream the response from OpenAI
			for await (const chunk of chatService.streamCompletion(messages)) {
				console.log("chunk", chunk);
				aiResponse += chunk;
				publisher.publish(
					channel,
					JSON.stringify({ type: "ai_chunk", content: chunk }),
				);
			}

			const embedding = await generateEmbedding(aiResponse);

			const [assistantMessage] = await db
				.insert(message)
				.values({
					conversationId: conversationId,
					role: "assistant",
					content: aiResponse,
					embedding: embedding,
				})
				.returning();

			await db
				.update(conversation)
				.set({ updatedAt: new Date() })
				.where(eq(conversation.id, conversationId));

			publisher.publish(
				channel,
				JSON.stringify({
					type: "ai_complete",
					content: aiResponse,
					messageId: assistantMessage.id,
				}),
			);
		} catch (error) {
			console.error(`[Worker] Error processing job ${job.id}:`, error);
			publisher.publish(
				channel,
				JSON.stringify({ type: "error", content: "An error occurred." }),
			);
		} finally {
			publisher.quit();
		}
	},
	{ connection: redis.duplicate() },
);

worker.on("completed", (job) => {
	console.log(`[Worker] Job ${job.id} has completed`);
});

worker.on("failed", (job, err) => {
	console.log(`[Worker] Job ${job?.id} has failed with ${err.message}`);
});

console.log("[Worker] Chat worker started");
