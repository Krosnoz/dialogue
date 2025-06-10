import { localDb } from "@/lib/db/local";
import { useUIStore } from "@/lib/stores/ui";
import { useTRPC } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
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

				setStreamingMessageId("ai-responding");
			},
			onError: (error) => {
				console.error("Failed to send message:", error);
				setStreamingMessageId(null);
			},
		}),
	);

	useSubscription(
		trpc.chat.onMessage.subscriptionOptions(
			{
				conversationId: conversationId!,
			},
			{
				enabled: !!conversationId,
				// @ts-expect-error TODO: fix this
				onData: async (data: {
					type: string;
					content: string;
					messageId?: string;
				}) => {
					if (data.type === "ai_chunk") {
						responseRef.current += data.content;
						setCurrentResponse(responseRef.current);
					} else if (data.type === "ai_complete") {
						await localDb.messages.put({
							id: data.messageId!,
							conversationId: conversationId!,
							role: "assistant",
							content: data.content,
							metadata: null,
							tokens: null,
							createdAt: new Date(),
							syncStatus: "synced",
						});
						setCurrentResponse("");
						responseRef.current = "";
						setStreamingMessageId(null);
					}
				},
				onError: (err) => {
					console.error("Streaming error:", err);
					setStreamingMessageId(null);
					setCurrentResponse("An error occurred. Please try again.");
					responseRef.current = "";
				},
			},
		),
	);

	const sendMessage = useCallback(
		async (content: string) => {
			if (!conversationId || !content.trim()) return;

			setCurrentResponse("");
			responseRef.current = "";

			await createMessageMutation.mutateAsync({
				conversationId,
				content,
			});
		},
		[conversationId, createMessageMutation],
	);

	return {
		messages: localMessages || [],
		sendMessage,
		isStreaming: !!streamingMessageId,
		currentResponse: streamingMessageId ? currentResponse : "",
	};
}
