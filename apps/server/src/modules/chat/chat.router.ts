import { z } from "zod";
import { protectedProcedure, router } from "../../lib/trpc";
import { chatService } from "./chat.service";
import {
	conversationParamsDto,
	createConversationDto,
	createMessageDto,
	createMessageStreamDto,
	createProjectDto,
	deleteConversationDto,
	getMessagesDto,
	projectParamsDto,
	searchMessagesDto,
	updateProjectDto,
} from "./dto";

export const chatRouter = router({
	listProjects: protectedProcedure.query(async ({ ctx }) => {
		return await chatService.listProjects(ctx.session.user.id);
	}),

	createProject: protectedProcedure
		.input(createProjectDto)
		.mutation(async ({ input, ctx }) => {
			return await chatService.createProject(input, ctx.session.user.id);
		}),

	updateProject: protectedProcedure
		.input(updateProjectDto)
		.mutation(async ({ input, ctx }) => {
			return await chatService.updateProject(input, ctx.session.user.id);
		}),

	deleteProject: protectedProcedure
		.input(projectParamsDto)
		.mutation(async ({ input, ctx }) => {
			return await chatService.deleteProject(input, ctx.session.user.id);
		}),

	listConversations: protectedProcedure
		.input(projectParamsDto)
		.query(async ({ input, ctx }) => {
			return await chatService.listConversations(
				input.projectId,
				ctx.session.user.id,
			);
		}),

	createConversation: protectedProcedure
		.input(createConversationDto)
		.mutation(async ({ input, ctx }) => {
			return await chatService.createConversation(input, ctx.session.user.id);
		}),

	getMessages: protectedProcedure
		.input(getMessagesDto)
		.query(async ({ input }) => {
			return await chatService.getMessages(input);
		}),

	createMessage: protectedProcedure
		.input(createMessageDto)
		.mutation(async ({ input, ctx }) => {
			return await chatService.createMessage(input, ctx.session.user.id);
		}),

	onMessage: protectedProcedure
		.input(z.object({ conversationId: z.string() }))
		.subscription(async function* ({ input, signal }) {
			yield* chatService.onMessage(input, signal);
		}),

	searchMessages: protectedProcedure
		.input(searchMessagesDto)
		.query(async ({ input, ctx }) => {
			return chatService.searchMessages(input, ctx.session.user.id);
		}),

	deleteConversation: protectedProcedure
		.input(deleteConversationDto)
		.mutation(async ({ input, ctx }) => {
			return await chatService.deleteConversation(input, ctx.session.user.id);
		}),
});
