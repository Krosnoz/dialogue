"use client";

import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { Card } from "@/components/ui/card";
import { useChat } from "@/lib/hooks/useChat";
import { useUIStore } from "@/lib/stores/ui";

export function ChatView() {
	const { currentConversationId, currentProjectId } = useUIStore();
	const { messages, sendMessage, isStreaming, currentResponse } = useChat(
		currentConversationId,
	);

	if (!currentProjectId) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Card className="max-w-md p-8 text-center">
					<h2 className="mb-2 font-semibold text-xl">Welcome!</h2>
					<p className="text-muted-foreground">
						Create a project to get started with your conversations.
					</p>
				</Card>
			</div>
		);
	}

	if (!currentConversationId) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Card className="max-w-md p-8 text-center">
					<h2 className="mb-2 font-semibold text-xl">Ready to chat!</h2>
					<p className="text-muted-foreground">
						Select a conversation or create a new one to start chatting.
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-1 flex-col">
			<div className="flex-1 overflow-hidden">
				<MessageList
					messages={messages}
					isStreaming={isStreaming}
					currentResponse={currentResponse}
				/>
			</div>
			<div className="border-t bg-background p-4">
				<MessageInput onSendMessage={sendMessage} disabled={isStreaming} />
			</div>
		</div>
	);
}
