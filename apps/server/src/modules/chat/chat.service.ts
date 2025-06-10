import { conversation, db, message, project } from "@dialogue/db";
import { and, cosineDistance, desc, eq, sql } from "@dialogue/db";
import { TRPCError } from "@trpc/server";
import {
	type ChatMessage,
	chatService as openaiChatService,
} from "../../lib/ai/chat.service";
import { generateEmbedding } from "../../lib/ai/embedding.service";
import { chatQueue } from "../../lib/queue";
import redis from "../../lib/redis";
import type {
	ConversationParamsDto,
	CreateConversationDto,
	CreateMessageDto,
	CreateMessageStreamDto,
	CreateProjectDto,
	DeleteConversationDto,
	GetMessagesDto,
	ProjectParamsDto,
	SearchMessagesDto,
	UpdateProjectDto,
} from "./dto";

export class ChatService {
	async listProjects(userId: string) {
		return await db
			.select()
			.from(project)
			.where(eq(project.userId, userId))
			.orderBy(desc(project.updatedAt));
	}

	async createProject(input: CreateProjectDto, userId: string) {
		const [projectInDb] = await db
			.insert(project)
			.values({
				userId,
				title: input.title,
				description: input.description,
			})
			.returning();

		return projectInDb;
	}

	async updateProject(input: UpdateProjectDto, userId: string) {
		const [updatedProject] = await db
			.update(project)
			.set({
				title: input.title,
				description: input.description,
				isArchived: input.isArchived,
				updatedAt: new Date(),
			})
			.where(and(eq(project.id, input.projectId), eq(project.userId, userId)))
			.returning();

		if (!updatedProject) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		return updatedProject;
	}

	async deleteProject(input: ProjectParamsDto, userId: string) {
		const result = await db
			.delete(project)
			.where(and(eq(project.id, input.projectId), eq(project.userId, userId)))
			.returning();

		if (!result.length) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		return { success: true };
	}

	async listConversations(projectId: string, userId: string) {
		const projectExists = await db
			.select()
			.from(project)
			.where(and(eq(project.id, projectId), eq(project.userId, userId)))
			.limit(1);

		if (!projectExists.length) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		return await db
			.select()
			.from(conversation)
			.where(eq(conversation.projectId, projectId))
			.orderBy(desc(conversation.updatedAt));
	}

	async createConversation(input: CreateConversationDto, userId: string) {
		const projectExists = await db
			.select()
			.from(project)
			.where(and(eq(project.id, input.projectId), eq(project.userId, userId)))
			.limit(1);

		if (!projectExists.length) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Project not found",
			});
		}

		const [conversationInDb] = await db
			.insert(conversation)
			.values({
				projectId: input.projectId,
				title: input.title,
			})
			.returning();

		return conversationInDb;
	}

	async getMessages(input: GetMessagesDto) {
		const conversationExists = await db
			.select()
			.from(message)
			.where(eq(message.conversationId, input.conversationId))
			.limit(1);

		if (!conversationExists.length) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Conversation not found",
			});
		}

		return await db
			.select()
			.from(message)
			.where(eq(message.conversationId, input.conversationId))
			.orderBy(message.createdAt);
	}

	async createMessage(input: CreateMessageDto, userId: string) {
		const conversationInDb = await db
			.select()
			.from(conversation)
			.innerJoin(project, eq(conversation.projectId, project.id))
			.where(
				and(
					eq(conversation.id, input.conversationId),
					eq(project.userId, userId),
				),
			)
			.limit(1);

		if (!conversationInDb.length) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Conversation not found",
			});
		}

		const embedding = await generateEmbedding(input.content);

		const [userMessage] = await db
			.insert(message)
			.values({
				conversationId: conversationInDb[0].conversation.id,
				role: "user",
				content: input.content,
				embedding: embedding,
			})
			.returning();

		// Queue the AI response generation
		await chatQueue.add("generate-response", {
			conversationId: input.conversationId,
			content: input.content,
		});

		await this.updateConversationTimestamp(input.conversationId);

		return { userMessage };
	}

	async *onMessage(input: { conversationId: string }, signal?: AbortSignal) {
		const channel = `chat:${input.conversationId}`;
		const subscriber = redis.duplicate();

		try {
			// Subscribe to the Redis channel
			await subscriber.subscribe(channel);

			// Create a queue to buffer messages
			const messageQueue: ChatMessage[] = [];
			let resolveNext: (() => void) | null = null;

			// Handle incoming messages
			subscriber.on("message", (ch, message) => {
				if (ch === channel) {
					try {
						const data = JSON.parse(message);
						if (data.type === "ai_chunk" || data.type === "ai_complete") {
							messageQueue.push(data);
							if (resolveNext) {
								resolveNext();
								resolveNext = null;
							}
						}
					} catch (error) {
						console.error("Failed to parse message:", error);
					}
				}
			});

			// Handle abort signal
			if (signal) {
				signal.addEventListener("abort", () => {
					subscriber.unsubscribe(channel);
					subscriber.quit();
				});
			}

			// Yield messages as they arrive
			while (!signal?.aborted) {
				if (messageQueue.length > 0) {
					yield messageQueue.shift();
				} else {
					// Wait for the next message
					await new Promise<void>((resolve) => {
						resolveNext = resolve;
						// Add a timeout to prevent infinite waiting
						setTimeout(resolve, 30000); // 30 second timeout
					});
				}
			}
		} finally {
			subscriber.unsubscribe(channel);
			subscriber.quit();
		}
	}

	async searchMessages(input: SearchMessagesDto, userId: string) {
		const embedding = await generateEmbedding(input.query);
		const similarity = sql<number>`1 - (${cosineDistance(
			message.embedding,
			embedding,
		)})`;

		const results = await db
			.select({
				id: message.id,
				content: message.content,
				role: message.role,
				createdAt: message.createdAt,
				similarity,
			})
			.from(message)
			.innerJoin(conversation, eq(message.conversationId, conversation.id))
			.innerJoin(project, eq(conversation.projectId, project.id))
			.where(
				and(
					eq(project.userId, userId),
					eq(conversation.id, input.conversationId),
				),
			)
			.orderBy(desc(similarity))
			.limit(10);

		return results;
	}

	async deleteConversation(input: DeleteConversationDto, userId: string) {
		const conversationExists = await db
			.select()
			.from(conversation)
			.innerJoin(project, eq(conversation.projectId, project.id))
			.where(
				and(
					eq(conversation.id, input.conversationId),
					eq(project.userId, userId),
				),
			)
			.limit(1);

		if (!conversationExists.length) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Conversation not found",
			});
		}

		await db
			.delete(conversation)
			.where(eq(conversation.id, input.conversationId));

		return { success: true };
	}

	private async updateConversationTimestamp(conversationId: string) {
		await db
			.update(conversation)
			.set({ updatedAt: new Date() })
			.where(eq(conversation.id, conversationId));
	}
}

export const chatService = new ChatService();
