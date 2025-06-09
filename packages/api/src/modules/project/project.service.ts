import { AppError } from "@dialogue/api/errors";
import { conversation, db, message, project } from "@dialogue/db";
import { and, desc, eq, inArray } from "@dialogue/db";
import type { DeleteProjectDto, RenameProjectDto } from "@dialogue/types";

export class ProjectService {
	async getById(projectId: string, userId: string) {
		const [projectData] = await db
			.select()
			.from(project)
			.where(and(eq(project.id, projectId), eq(project.userId, userId)))
			.limit(1);

		if (!projectData) {
			throw AppError.notFound("Project not found").toTRPCError();
		}
		return projectData;
	}

	async list(userId: string) {
		return await db
			.select()
			.from(project)
			.where(eq(project.userId, userId))
			.orderBy(desc(project.updatedAt));
	}

	async listRecent(userId: string) {
		return await db
			.select()
			.from(project)
			.where(eq(project.userId, userId))
			.orderBy(desc(project.updatedAt))
			.limit(5);
	}

	async delete(input: DeleteProjectDto, userId: string) {
		await this.getById(input.projectId, userId);

		await db
			.delete(message)
			.where(
				inArray(
					message.conversationId,
					db
						.select({ id: conversation.id })
						.from(conversation)
						.where(eq(conversation.projectId, input.projectId)),
				),
			);

		await db
			.delete(conversation)
			.where(eq(conversation.projectId, input.projectId));

		await db.delete(project).where(eq(project.id, input.projectId));

		return { success: true };
	}

	async rename(input: RenameProjectDto, userId: string) {
		await this.getById(input.projectId, userId);

		const [updatedProject] = await db
			.update(project)
			.set({
				title: input.title,
				description: input.description,
				updatedAt: new Date(),
			})
			.where(eq(project.id, input.projectId))
			.returning();

		if (!updatedProject) {
			throw new AppError("Failed to rename project").toTRPCError();
		}

		return updatedProject;
	}
}

export const projectService = new ProjectService();
