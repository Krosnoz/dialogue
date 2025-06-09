import { useChatSettingsStore } from "@/lib/stores/chat-settings";
import { useTRPC } from "@dialogue/api/client";
import type { StreamMessage, UnifiedMessage } from "@dialogue/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function useChat(conversationId?: string) {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [streamingMessage, setStreamingMessage] =
		useState<UnifiedMessage | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { selectedProvider, selectedModel, apiKeys } = useChatSettingsStore();

	const {
		data: serverMessages = [],
		isLoading: isLoadingMessages,
		error: errorMessages,
	} = useQuery({
		...trpc.message.list.queryOptions({ conversationId: conversationId! }),
		enabled: !!conversationId,
	});

	useSubscription(
		trpc.message.onMessageUpdate.subscriptionOptions(
			{ conversationId: conversationId! },
			{
				enabled: !!conversationId,
				onData(data: StreamMessage) {
					if (data.type === "chunk" && errorMessage) {
						setErrorMessage(null);
					}

					if (data.type === "chunk") {
						setStreamingMessage((prev) => ({
							id: prev?.id || `streaming-${Date.now()}`,
							role: "assistant",
							content: (prev?.content || "") + data.content,
							createdAt: prev?.createdAt || new Date().toISOString(),
							isStreaming: true,
						}));
					} else if (data.type === "complete") {
						if (conversationId && data.messageId && data.content) {
							const queryKey = trpc.message.list.queryKey({
								conversationId: conversationId!,
							});

							queryClient.setQueryData(queryKey, (oldData) => {
								if (!oldData) return oldData;

								const completedMessage = {
									id: data.messageId,
									role: "assistant",
									content: data.content,
									createdAt: new Date().toISOString(),
									updatedAt: new Date().toISOString(),
									conversationId: conversationId,
									provider: null,
									model: null,
									parentId: null,
									embedding: null,
								};

								return [...oldData, completedMessage];
							});
						}

						setStreamingMessage(null);
						setErrorMessage(null);
					} else if (data.type === "error") {
						setStreamingMessage(null);
						setErrorMessage(data.content);
					}
				},
			},
		),
	);

	const sendMessageMutation = useMutation({
		...trpc.message.send.mutationOptions(),
		onError: (error) => {
			console.error("Send message error:", error);
			setErrorMessage(error.message || "Failed to send message");
		},
		onSuccess: async (data, variables) => {
			if (!variables.conversationId && data.conversationId) {
				await queryClient.invalidateQueries(
					trpc.conversation.listAll.queryOptions(),
				);
				router.push(`/chat/${data.conversationId}`);
			} else if (conversationId && variables.content) {
				const queryKey = trpc.message.list.queryKey({
					conversationId: conversationId!,
				});

				queryClient.setQueryData(queryKey, (oldData) => {
					if (!oldData) return oldData;

					const userMessages = variables.content
						.filter((msg) => msg.role === "user")
						.map((msg) => ({
							id: `user-${Date.now()}-${Math.random()}`,
							role: msg.role,
							content: msg.content,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
							conversationId,
							provider: null,
							model: null,
							parentId: null,
							embedding: null,
						}));

					return [...oldData, ...userMessages];
				});
			}
		},
	});

	const sendMessage = useCallback(
		(content: string, systemInstructions: string | undefined) => {
			setErrorMessage(null);

			const apiMessages = [
				...(systemInstructions
					? [{ role: "system" as const, content: systemInstructions }]
					: []),
				{ role: "user" as const, content },
			];

			sendMessageMutation.mutate({
				conversationId,
				content: apiMessages,
				provider: selectedProvider,
				model: selectedModel,
				apiKey: apiKeys[selectedProvider],
			});
		},
		[
			conversationId,
			sendMessageMutation,
			selectedProvider,
			selectedModel,
			apiKeys,
			errorMessage,
		],
	);

	const messages = useMemo(() => {
		const allMessages = [...(serverMessages as UnifiedMessage[])];

		if (streamingMessage) {
			allMessages.push(streamingMessage);
		}

		return allMessages;
	}, [serverMessages, streamingMessage]);

	const isStreaming = !!streamingMessage;

	return {
		messages,
		sendMessage,
		isLoading: isLoadingMessages,
		isStreaming,
		errorMessage,
		clearError: () => setErrorMessage(null),
	};
}
