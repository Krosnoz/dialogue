import { type LocalConversation, localDb } from "@/lib/db/local";
import { useUIStore } from "@/lib/stores/ui";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect } from "react";

export function useConversations() {
	const { setCurrentConversationId } = useUIStore();
	const trpc = useTRPC();

	const localConversations = useLiveQuery(
		() => localDb.conversations.orderBy("updatedAt").reverse().toArray(),
		[],
	);

	const { data: serverConversations, refetch } = useQuery(
		trpc.chat.listConversations.queryOptions(undefined, {
			staleTime: 1000 * 60 * 2,
		}),
	);

	const createConversationMutation = useMutation(
		trpc.chat.createConversation.mutationOptions({
			onSuccess: async (newConversation) => {
				await localDb.conversations.put({
					id: newConversation.id,
					projectId: newConversation.projectId,
					title: newConversation.title,
					createdAt: new Date(newConversation.createdAt),
					updatedAt: new Date(newConversation.updatedAt),
					syncStatus: "synced",
				});

				setCurrentConversationId(newConversation.id);
			},
		}),
	);

	const deleteConversationMutation = useMutation(
		trpc.chat.deleteConversation.mutationOptions({
			onSuccess: async (_, variables: { conversationId: string }) => {
				await localDb.conversations.delete(variables.conversationId);
				await localDb.messages
					.where("conversationId")
					.equals(variables.conversationId)
					.delete();
			},
		}),
	);

	useEffect(() => {
		if (serverConversations?.length) {
			const syncConversations = async () => {
				for (const serverConversation of serverConversations) {
					await localDb.conversations.put({
						id: serverConversation.conversation.id,
						projectId: serverConversation.conversation.projectId,
						title: serverConversation.conversation.title,
						createdAt: new Date(serverConversation.conversation.createdAt),
						updatedAt: new Date(serverConversation.conversation.updatedAt),
						syncStatus: "synced",
					});
				}
			};
			syncConversations();
		}
	}, [serverConversations]);

	const createConversation = useCallback(
		async (title: string) => {
			try {
				const tempId = `temp-${Date.now()}`;
				const tempConversation: LocalConversation = {
					id: tempId,
					projectId: "temp-project",
					title,
					createdAt: new Date(),
					updatedAt: new Date(),
					syncStatus: "pending",
				};

				await localDb.conversations.put(tempConversation);
				setCurrentConversationId(tempId);

				const result = await createConversationMutation.mutateAsync({ title });

				await localDb.conversations.delete(tempId);

				return result;
			} catch (error) {
				console.error("Failed to create conversation:", error);
				throw error;
			}
		},
		[createConversationMutation, setCurrentConversationId],
	);

	const deleteConversation = useCallback(
		async (conversationId: string) => {
			try {
				await deleteConversationMutation.mutateAsync({ conversationId });
			} catch (error) {
				console.error("Failed to delete conversation:", error);
				throw error;
			}
		},
		[deleteConversationMutation],
	);

	return {
		conversations: localConversations || [],
		createConversation,
		deleteConversation,
		isCreating: createConversationMutation.isPending,
		isDeleting: deleteConversationMutation.isPending,
		refetch,
	};
}
