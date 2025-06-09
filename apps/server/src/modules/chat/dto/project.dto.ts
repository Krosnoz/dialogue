import { z } from "zod";

export const createProjectDto = z.object({
	title: z.string().min(1).max(255),
	description: z.string().optional(),
});

export const projectParamsDto = z.object({
	projectId: z.string().uuid(),
});

export const updateProjectDto = z.object({
	projectId: z.string().uuid(),
	title: z.string().min(1).max(255).optional(),
	description: z.string().optional(),
	isArchived: z.boolean().optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectDto>;
export type ProjectParamsDto = z.infer<typeof projectParamsDto>;
export type UpdateProjectDto = z.infer<typeof updateProjectDto>;
