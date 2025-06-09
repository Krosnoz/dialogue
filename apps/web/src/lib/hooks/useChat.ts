import { localDb } from "@/lib/db/local";
import { useUIStore } from "@/lib/stores/ui";
import { useTRPC } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useRef, useState } from "react";
import { useSyncMessages } from "./useSync";

export function useChat(conversationId: string | null) {
	const { setStreamingMessageId, streamingMessageId } = useUIStore();
	const [currentResponse, setCurrentResponse] = useState("");
	const responseRef = useRef("");
	const trpc = useTRPC();
	useSyncMessages(conversationId || undefined);

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

	const createMessageMutation = useMutation(
		trpc.chat.createMessage.mutationOptions({
			onSuccess: async (data) => {
				await localDb.messages.put({
					id: data.userMessage.id,
					conversationId: data.userMessage.conversationId,
					role: "user",
					content: data.userMessage.content,
					metadata: data.userMessage.metadata,
					tokens: data.userMessage.tokens,
					createdAt: new Date(data.userMessage.createdAt),
					syncStatus: "synced",
				});

				await localDb.messages.put({
					id: data.assistantMessage.id,
					conversationId: data.assistantMessage.conversationId,
					role: "assistant",
					content: data.assistantMessage.content,
					metadata: data.assistantMessage.metadata,
					tokens: data.assistantMessage.tokens,
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
