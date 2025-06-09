import { protectedProcedure, router } from "../../lib/trpc";
import { chatService } from "./chat.service";
import {
	conversationParamsDto,
	createConversationDto,
	createMessageDto,
	createMessageStreamDto,
	deleteConversationDto,
	getMessagesDto,
} from "./dto";

export const chatRouter = router({
	listConversations: protectedProcedure.query(async ({ ctx }) => {
		return await chatService.listConversations(ctx.session.user.id);
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

	createMessageStream: protectedProcedure
		.input(createMessageStreamDto)
		.subscription(async ({ input, ctx }) => {
			return chatService.createMessageStream(input, ctx.session.user.id);
		}),

	deleteConversation: protectedProcedure
		.input(deleteConversationDto)
		.mutation(async ({ input, ctx }) => {
			return await chatService.deleteConversation(input, ctx.session.user.id);
		}),
});
