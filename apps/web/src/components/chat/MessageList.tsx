"use client";

import { Message } from "@/components/chat/Message";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { LocalMessage } from "@/lib/db/local";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

interface MessageListProps {
	messages: LocalMessage[];
	isStreaming: boolean;
	currentResponse: string;
}

export function MessageList({
	messages,
	isStreaming,
	currentResponse,
}: MessageListProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const allMessages = [...messages];
	if (isStreaming && currentResponse) {
		allMessages.push({
			id: "streaming",
			conversationId: "",
			role: "assistant",
			content: currentResponse,
			createdAt: new Date(),
			syncStatus: "pending",
		} as LocalMessage);
	}

	const virtualizer = useVirtualizer({
		count: allMessages.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 100,
		overscan: 5,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (parentRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

			if (isNearBottom) {
				virtualizer.scrollToIndex(allMessages.length - 1, {
					align: "end",
					behavior: "smooth",
				});
			}
		}
	}, [allMessages.length, currentResponse, virtualizer]);

	return (
		<div
			ref={parentRef}
			className="h-full overflow-auto p-4"
			style={{
				contain: "strict",
			}}
		>
			<div
				style={{
					height: `${virtualizer.getTotalSize()}px`,
					width: "100%",
					position: "relative",
				}}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => {
					const message = allMessages[virtualItem.index];

					return (
						<div
							key={virtualItem.key}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: `${virtualItem.size}px`,
								transform: `translateY(${virtualItem.start}px)`,
							}}
						>
							<Message
								message={message}
								isStreaming={message.id === "streaming"}
							/>
						</div>
					);
				})}
			</div>

			{isStreaming && !currentResponse && <TypingIndicator />}
		</div>
	);
}
