export * from "./message.dto";

export type MessageListType = UnifiedMessage[];

export type StreamMessage =
	| { type: "conversation_created"; conversationId: string }
	| { type: "chunk"; content: string }
	| { type: "complete"; messageId: string; content: string }
	| { type: "error"; content: string };

export type MessageCreateConversationWithMessageType = {
	conversationId: string;
};
export interface UnifiedMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	createdAt: string;
	isStreaming?: boolean;
	updatedAt?: string;
	conversationId?: string;
	provider?: string | null;
	model?: string | null;
	parentId?: string | null;
	embedding?: number[] | null;
}

export interface LocalMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	createdAt: string;
	isStreaming?: boolean;
}
