"use client";

import { useChat } from "@/hooks/use-chat";
import type { ConversationOutputs } from "@dialogue/api";
import { useTRPC } from "@dialogue/api/client";
import { useEffect, useRef, useState } from "react";
import { MessageList } from "../chat/[id]/_composants/MessageList/message-list";
import { ChatHeader } from "./chat-header";
import { MessageInput, type MessageInputRef } from "./message-input";

interface ChatContainerProps {
	conversation?: ConversationOutputs["getById"];
	title?: string;
}

export function ChatContainer({
	conversation,
	title = "Untitled Chat",
}: ChatContainerProps) {
	const trpc = useTRPC();
	const [systemInstructions, setSystemInstructions] = useState("");
	const {
		messages,
		sendMessage,
		isLoading: isLoadingChat,
		isStreaming,
		errorMessage,
		clearError,
	} = useChat(conversation?.id);
	const messageInputRef = useRef<MessageInputRef>(null);

	const handleSendMessage = (message: string) => {
		sendMessage(message, systemInstructions);
	};

	useEffect(() => {
		if (!messages || messages.length === 0) return;
		const systemMessage = messages.find((msg) => msg.role === "system");
		if (systemMessage && systemMessage.content !== systemInstructions) {
			setSystemInstructions(systemMessage.content);
		}
	}, [messages, systemInstructions]);

	useEffect(() => {
		if (!isStreaming && messages && messages.length > 0) {
			messageInputRef.current?.focus();
		}
	}, [isStreaming, messages]);

	return (
		<div className="flex h-full flex-col">
			<ChatHeader
				title={conversation?.title || title}
				projectId={conversation?.projectId}
				projectTitle={conversation?.projectTitle}
				systemInstructions={systemInstructions}
				onSystemInstructionsChange={setSystemInstructions}
				disabled={conversation?.id ? messages.length !== 0 : false}
			/>

			<MessageList
				messages={messages}
				isLoading={isLoadingChat}
				errorMessage={errorMessage}
				onClearError={clearError}
			/>

			<MessageInput
				ref={messageInputRef}
				onSendMessage={handleSendMessage}
				disabled={isStreaming}
			/>
		</div>
	);
}
