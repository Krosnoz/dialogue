import { localDb } from "@/lib/db/local";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useSync() {
	const trpc = useTRPC();

	// Sync projects
	const { data: serverProjects } = useQuery(
		trpc.chat.listProjects.queryOptions(undefined, {
			staleTime: 1000 * 30, // 30 seconds
			refetchInterval: 1000 * 60, // 1 minute
		}),
	);

	useEffect(() => {
		if (serverProjects?.length) {
			const syncProjects = async () => {
				try {
					for (const serverProject of serverProjects) {
						await localDb.projects.put({
							id: serverProject.id,
							userId: serverProject.userId,
							title: serverProject.title,
							description: serverProject.description,
							settings: serverProject.settings,
							isArchived: serverProject.isArchived,
							createdAt: new Date(serverProject.createdAt),
							updatedAt: new Date(serverProject.updatedAt),
							syncStatus: "synced",
						});
					}

					// Remove local projects that no longer exist on server
					const localProjects = await localDb.projects.toArray();
					const serverProjectIds = new Set(serverProjects.map((p) => p.id));

					for (const localProject of localProjects) {
						if (
							!serverProjectIds.has(localProject.id) &&
							!localProject.id.startsWith("temp-")
						) {
							await localDb.projects.delete(localProject.id);
						}
					}
				} catch (error) {
					console.error("Failed to sync projects:", error);
				}
			};
			syncProjects();
		}
	}, [serverProjects]);

	return {
		isOnline: navigator.onLine,
		lastSync: new Date(),
	};
}

export function useSyncConversations(projectId?: string) {
	const trpc = useTRPC();

	const { data: serverConversations } = useQuery(
		trpc.chat.listConversations.queryOptions(
			{ projectId: projectId || "" },
			{
				enabled: !!projectId,
				staleTime: 1000 * 30,
				refetchInterval: 1000 * 60,
			},
		),
	);

	useEffect(() => {
		if (serverConversations?.length && projectId) {
			const syncConversations = async () => {
				try {
					for (const serverConversation of serverConversations) {
						await localDb.conversations.put({
							id: serverConversation.id,
							projectId: serverConversation.projectId,
							title: serverConversation.title,
							createdAt: new Date(serverConversation.createdAt),
							updatedAt: new Date(serverConversation.updatedAt),
							syncStatus: "synced",
						});
					}

					// Remove local conversations that no longer exist on server
					const localConversations = await localDb.conversations
						.where("projectId")
						.equals(projectId)
						.toArray();
					const serverConversationIds = new Set(
						serverConversations.map((c) => c.id),
					);

					for (const localConversation of localConversations) {
						if (
							!serverConversationIds.has(localConversation.id) &&
							!localConversation.id.startsWith("temp-")
						) {
							await localDb.conversations.delete(localConversation.id);
						}
					}
				} catch (error) {
					console.error("Failed to sync conversations:", error);
				}
			};
			syncConversations();
		}
	}, [serverConversations, projectId]);
}

export function useSyncMessages(conversationId?: string) {
	const trpc = useTRPC();

	const { data: serverMessages } = useQuery(
		trpc.chat.getMessages.queryOptions(
			{ conversationId: conversationId || "" },
			{
				enabled: !!conversationId,
				staleTime: 1000 * 30,
				refetchInterval: 1000 * 60,
			},
		),
	);

	useEffect(() => {
		if (serverMessages?.length && conversationId) {
			const syncMessages = async () => {
				try {
					for (const serverMessage of serverMessages) {
						await localDb.messages.put({
							id: serverMessage.id,
							conversationId: serverMessage.conversationId,
							role: serverMessage.role as "user" | "assistant",
							content: serverMessage.content,
							metadata: serverMessage.metadata,
							tokens: serverMessage.tokens,
							createdAt: new Date(serverMessage.createdAt),
							syncStatus: "synced",
						});
					}

					// Remove local messages that no longer exist on server
					const localMessages = await localDb.messages
						.where("conversationId")
						.equals(conversationId)
						.toArray();
					const serverMessageIds = new Set(serverMessages.map((m) => m.id));

					for (const localMessage of localMessages) {
						if (
							!serverMessageIds.has(localMessage.id) &&
							!localMessage.id.startsWith("temp-") &&
							localMessage.id !== "streaming"
						) {
							await localDb.messages.delete(localMessage.id);
						}
					}
				} catch (error) {
					console.error("Failed to sync messages:", error);
				}
			};
			syncMessages();
		}
	}, [serverMessages, conversationId]);
}
