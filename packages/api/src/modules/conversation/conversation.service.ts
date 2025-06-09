import { AppError } from "@dialogue/api/errors";
import { conversation, db, project } from "@dialogue/db";
import { and, desc, eq, isNull } from "@dialogue/db";
import type {
	AddConversationToProjectDto,
	CreateProjectWithConversationDto,
	DeleteConversationDto,
	RemoveConversationFromProjectDto,
	RenameConversationDto,
} from "@dialogue/types";

export class ConversationService {
	async verifyAccess(conversationId: string, userId: string): Promise<void> {
		const [conversationData] = await db
			.select({ id: conversation.id })
			.from(conversation)
			.where(
				and(
					eq(conversation.id, conversationId),
					eq(conversation.userId, userId),
				),
			)
			.limit(1);

		console.log("conversationData", conversationData);
		if (!conversationData) {
			console.log("Conversation not found");
			throw AppError.notFound("Conversation not found").toTRPCError();
		}
	}

	async getById(conversationId: string, userId: string) {
		const [conversationData] = await db
			.select({
				id: conversation.id,
				userId: conversation.userId,
				projectId: conversation.projectId,
				title: conversation.title,
				createdAt: conversation.createdAt,
				updatedAt: conversation.updatedAt,
				projectTitle: project.title,
			})
			.from(conversation)
			.leftJoin(project, eq(conversation.projectId, project.id))
			.where(
				and(
					eq(conversation.id, conversationId),
					eq(conversation.userId, userId),
				),
			)
			.limit(1);

		if (!conversationData) {
			console.log("Conversation not found, throwing error");
			throw AppError.notFound("Conversation not found").toTRPCError();
		}
		console.log("Conversation found, returning data");
		return conversationData;
	}

	async listAll(userId: string) {
		return await db
			.select({
				id: conversation.id,
				userId: conversation.userId,
				projectId: conversation.projectId,
				title: conversation.title,
				createdAt: conversation.createdAt,
				updatedAt: conversation.updatedAt,
				projectTitle: project.title,
			})
			.from(conversation)
			.leftJoin(project, eq(conversation.projectId, project.id))
			.where(
				and(eq(conversation.userId, userId), isNull(conversation.projectId)),
			)
			.orderBy(desc(conversation.updatedAt));
	}

	async listByProject(projectId: string, userId: string) {
		return await db
			.select({
				id: conversation.id,
				userId: conversation.userId,
				projectId: conversation.projectId,
				title: conversation.title,
				createdAt: conversation.createdAt,
				updatedAt: conversation.updatedAt,
				projectTitle: project.title,
			})
			.from(conversation)
			.leftJoin(project, eq(conversation.projectId, project.id))
			.where(
				and(
					eq(conversation.userId, userId),
					eq(conversation.projectId, projectId),
				),
			)
			.orderBy(desc(conversation.updatedAt));
	}

	async create(userId: string, title?: string, projectId?: string) {
		const [conversationInDb] = await db
			.insert(conversation)
			.values({
				userId,
				projectId: projectId || null,
				title: title || null,
			})
			.returning();

		if (!conversationInDb) {
			throw new AppError("Failed to create conversation").toTRPCError();
		}

		return conversationInDb;
	}

	async delete(input: DeleteConversationDto, userId: string) {
		await this.verifyAccess(input.conversationId, userId);

		await db
			.delete(conversation)
			.where(eq(conversation.id, input.conversationId));

		return { success: true };
	}

	async rename(input: RenameConversationDto, userId: string) {
		await this.verifyAccess(input.conversationId, userId);

		const [updatedConversation] = await db
			.update(conversation)
			.set({
				title: input.title,
				updatedAt: new Date(),
			})
			.where(eq(conversation.id, input.conversationId))
			.returning();

		if (!updatedConversation) {
			throw new AppError("Failed to rename conversation").toTRPCError();
		}

		return updatedConversation;
	}

	async addToProject(input: AddConversationToProjectDto, userId: string) {
		await this.verifyAccess(input.conversationId, userId);

		const projectData = await db
			.select()
			.from(project)
			.where(and(eq(project.id, input.projectId), eq(project.userId, userId)))
			.limit(1);

		if (projectData.length === 0) {
			throw AppError.notFound("Project not found").toTRPCError();
		}

		const [updatedConversation] = await db
			.update(conversation)
			.set({
				projectId: input.projectId,
				updatedAt: new Date(),
			})
			.where(eq(conversation.id, input.conversationId))
			.returning();

		if (!updatedConversation) {
			throw new AppError("Failed to add conversation to project").toTRPCError();
		}

		return updatedConversation;
	}

	async createProjectWithConversation(
		input: CreateProjectWithConversationDto,
		userId: string,
	) {
		await this.verifyAccess(input.conversationId, userId);

		const [newProject] = await db
			.insert(project)
			.values({
				userId,
				title: input.title,
				description: input.description || null,
			})
			.returning();

		if (!newProject) {
			throw new AppError("Failed to create project").toTRPCError();
		}

		const [updatedConversation] = await db
			.update(conversation)
			.set({
				projectId: newProject.id,
				updatedAt: new Date(),
			})
			.where(eq(conversation.id, input.conversationId))
			.returning();

		if (!updatedConversation) {
			throw new AppError("Failed to add conversation to project").toTRPCError();
		}

		return {
			project: newProject,
			conversation: updatedConversation,
		};
	}

	async removeFromProject(
		input: RemoveConversationFromProjectDto,
		userId: string,
	) {
		await this.verifyAccess(input.conversationId, userId);

		const [updatedConversation] = await db
			.update(conversation)
			.set({
				projectId: null,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(conversation.id, input.conversationId),
					eq(conversation.projectId, input.projectId),
				),
			)
			.returning();

		console.log("updatedConversation", updatedConversation);
		if (!updatedConversation) {
			throw new AppError(
				"Failed to remove conversation from project",
			).toTRPCError();
		}

		return updatedConversation;
	}
}

export const conversationService = new ConversationService();
