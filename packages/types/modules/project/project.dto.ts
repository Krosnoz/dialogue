import { z } from "zod";

export const getProjectByIdDto = z.object({
	projectId: z.string().uuid(),
});

export const deleteProjectDto = z.object({
	projectId: z.string().uuid(),
});

export const renameProjectDto = z.object({
	projectId: z.string().uuid(),
	title: z.string().min(1).max(255),
	description: z.string().optional(),
});

export type GetProjectByIdDto = z.infer<typeof getProjectByIdDto>;
export type DeleteProjectDto = z.infer<typeof deleteProjectDto>;
export type RenameProjectDto = z.infer<typeof renameProjectDto>;
