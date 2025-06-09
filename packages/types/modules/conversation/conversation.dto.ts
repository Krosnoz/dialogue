import { z } from "zod";

export const deleteConversationDto = z.object({
	conversationId: z.string().uuid(),
});

export const getConversationByIdDto = z.object({
	conversationId: z.string().uuid(),
});

export const renameConversationDto = z.object({
	conversationId: z.string().uuid(),
	title: z.string().min(1).max(255),
});

export const addConversationToProjectDto = z.object({
	conversationId: z.string().uuid(),
	projectId: z.string().uuid(),
});

export const createProjectWithConversationDto = z.object({
	conversationId: z.string().uuid(),
	title: z.string().min(1).max(255),
	description: z.string().optional(),
});

export const listConversationsByProjectDto = z.object({
	projectId: z.string().uuid(),
});

export const removeConversationFromProjectDto = z.object({
	conversationId: z.string().uuid(),
	projectId: z.string().uuid(),
});

export type DeleteConversationDto = z.infer<typeof deleteConversationDto>;
export type GetConversationByIdDto = z.infer<typeof getConversationByIdDto>;
export type RenameConversationDto = z.infer<typeof renameConversationDto>;
export type AddConversationToProjectDto = z.infer<
	typeof addConversationToProjectDto
>;
export type CreateProjectWithConversationDto = z.infer<
	typeof createProjectWithConversationDto
>;
export type ListConversationsByProjectDto = z.infer<
	typeof listConversationsByProjectDto
>;
export type RemoveConversationFromProjectDto = z.infer<
	typeof removeConversationFromProjectDto
>;
