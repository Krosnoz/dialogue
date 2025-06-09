import { localDb } from "@/lib/db/local";
import { useUIStore } from "@/lib/stores/ui";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useRef, useState } from "react";

export function useChat(conversationId: string | null) {
	const { setStreamingMessageId, streamingMessageId } = useUIStore();
	const [currentResponse, setCurrentResponse] = useState("");
	const responseRef = useRef("");
	const trpc = useTRPC();

	const localMessages = useLiveQuery(
		() =>
			conversationId
				? localDb.messages
						.where("conversationId")
						.equals(conversationId)
						.toArray()
				: [],
		[conversationId],
	);

	const { data: serverMessages } = useQuery(
		trpc.chat.getMessages.queryOptions(
			{ conversationId: conversationId! },
			{
				enabled: !!conversationId,
				staleTime: 1000 * 60 * 5,
			},
		),
	);

	useEffect(() => {
		if (serverMessages?.length && conversationId) {
			const syncMessages = async () => {
				for (const serverMessage of serverMessages) {
					await localDb.messages.put({
						id: serverMessage.id,
						conversationId: serverMessage.conversationId,
						role: serverMessage.role as "user" | "assistant",
						content: serverMessage.content,
						createdAt: new Date(serverMessage.createdAt),
						syncStatus: "synced",
					});
				}
			};
			syncMessages();
		}
	}, [serverMessages, conversationId]);

	const createMessageMutation = useMutation(
		trpc.chat.createMessage.mutationOptions({
			onSuccess: async (data) => {
				await localDb.messages.put({
					id: data.userMessage.id,
					conversationId: data.userMessage.conversationId,
					role: "user",
					content: data.userMessage.content,
					createdAt: new Date(data.userMessage.createdAt),
					syncStatus: "synced",
				});

				await localDb.messages.put({
					id: data.assistantMessage.id,
					conversationId: data.assistantMessage.conversationId,
					role: "assistant",
					content: data.assistantMessage.content,
					createdAt: new Date(data.assistantMessage.createdAt),
					syncStatus: "synced",
				});

				setStreamingMessageId(null);
			},
			onError: (error) => {
				console.error("Failed to send message:", error);
				setStreamingMessageId(null);
			},
		}),
	);

	const sendMessage = useCallback(
		async (content: string) => {
			if (!conversationId || !content.trim()) return;

			setStreamingMessageId("sending");

			try {
				await createMessageMutation.mutateAsync({
					conversationId,
					content,
				});
			} catch (error) {
				console.error("Failed to send message:", error);
			}
		},
		[conversationId, createMessageMutation, setStreamingMessageId],
	);

	return {
		messages: localMessages || [],
		sendMessage,
		isStreaming: !!streamingMessageId,
		currentResponse: streamingMessageId ? currentResponse : "",
	};
}
