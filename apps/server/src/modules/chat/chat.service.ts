import { conversation, db, message, project } from "@dialogue/db";
import { and, desc, eq } from "@dialogue/db";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { Context } from "../../lib/context";
import type {
	ConversationParamsDto,
	CreateConversationDto,
	CreateMessageDto,
	CreateMessageStreamDto,
	CreateProjectDto,
	DeleteConversationDto,
	GetMessagesDto,
	ProjectParamsDto,
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

		const [userMessage] = await db
			.insert(message)
			.values({
				conversationId: conversationInDb[0].conversation.id,
				role: "user",
				content: input.content,
			})
			.returning();

		const aiResponse = `Merci pour votre message: "${input.content}". Voici ma réponse simulée.`;

		const [assistantMessage] = await db
			.insert(message)
			.values({
				conversationId: conversationInDb[0].conversation.id,
				role: "assistant",
				content: aiResponse,
			})
			.returning();

		await this.updateConversationTimestamp(input.conversationId);

		return {
			userMessage,
			assistantMessage,
		};
	}

	createMessageStream(input: CreateMessageStreamDto, userId: string) {
		return observable<{
			type: "user_message" | "ai_chunk" | "ai_complete";
			content: string;
			messageId?: string;
		}>((emit) => {
			(async () => {
				try {
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

					const [userMessage] = await db
						.insert(message)
						.values({
							conversationId: conversationInDb[0].conversation.id,
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
						.insert(message)
						.values({
							conversationId: conversationInDb[0].conversation.id,
							role: "assistant",
							content: aiResponse,
						})
						.returning();

					await this.updateConversationTimestamp(input.conversationId);

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
