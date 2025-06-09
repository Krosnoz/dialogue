"use client";

import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { Card } from "@/components/ui/card";
import { useChat } from "@/lib/hooks/useChat";
import { useUIStore } from "@/lib/stores/ui";

export function ChatView() {
	const { currentConversationId } = useUIStore();
	const { messages, sendMessage, isStreaming, currentResponse } = useChat(
		currentConversationId,
	);

	if (!currentConversationId) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Card className="max-w-md p-8 text-center">
					<h2 className="mb-2 font-semibold text-xl">Bienvenue !</h2>
					<p className="text-muted-foreground">
						Sélectionnez une conversation ou créez-en une nouvelle pour
						commencer.
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
