import { protectedProcedure, router } from "@dialogue/api/server";
import {
	addConversationToProjectDto,
	createProjectWithConversationDto,
	deleteConversationDto,
	getConversationByIdDto,
	listConversationsByProjectDto,
	removeConversationFromProjectDto,
	renameConversationDto,
} from "@dialogue/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { conversationService } from "./conversation.service";

export const conversationRouter = router({
	getById: protectedProcedure
		.input(getConversationByIdDto)
		.query(async ({ input, ctx }) => {
			return await conversationService.getById(
				input.conversationId,
				ctx.session.user.id,
			);
		}),

	listAll: protectedProcedure.query(async ({ ctx }) => {
		return await conversationService.listAll(ctx.session.user.id);
	}),

	listByProject: protectedProcedure
		.input(listConversationsByProjectDto)
		.query(async ({ input, ctx }) => {
			return await conversationService.listByProject(
				input.projectId,
				ctx.session.user.id,
			);
		}),

	delete: protectedProcedure
		.input(deleteConversationDto)
		.mutation(async ({ input, ctx }) => {
			return await conversationService.delete(input, ctx.session.user.id);
		}),

	rename: protectedProcedure
		.input(renameConversationDto)
		.mutation(async ({ input, ctx }) => {
			return await conversationService.rename(input, ctx.session.user.id);
		}),

	addToProject: protectedProcedure
		.input(addConversationToProjectDto)
		.mutation(async ({ input, ctx }) => {
			return await conversationService.addToProject(input, ctx.session.user.id);
		}),

	createProjectWithConversation: protectedProcedure
		.input(createProjectWithConversationDto)
		.mutation(async ({ input, ctx }) => {
			return await conversationService.createProjectWithConversation(
				input,
				ctx.session.user.id,
			);
		}),

	removeFromProject: protectedProcedure
		.input(removeConversationFromProjectDto)
		.mutation(async ({ input, ctx }) => {
			return await conversationService.removeFromProject(
				input,
				ctx.session.user.id,
			);
		}),
});

export type ConversationRouter = typeof conversationRouter;
export type ConversationInputs = inferRouterInputs<ConversationRouter>;
export type ConversationOutputs = inferRouterOutputs<ConversationRouter>;
