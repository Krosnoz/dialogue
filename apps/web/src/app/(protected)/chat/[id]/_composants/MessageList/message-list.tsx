"use client";

import { Button } from "@/components/ui/button";
import { MessageContent } from "@/components/ui/message-content";
import { cn } from "@/lib/utils";
import type { MessageListType, UnifiedMessage } from "@dialogue/types";
import { AlertCircle, Bot, User, X } from "lucide-react";
import { useAutoScroll } from "./hooks/use-auto-scroll";

interface MessageListProps {
	messages: MessageListType | UnifiedMessage[] | undefined;
	isLoading: boolean;
	errorMessage?: string | null;
	onClearError?: () => void;
}

export function MessageList({
	messages,
	isLoading,
	errorMessage,
	onClearError,
}: MessageListProps) {
	const { scrollTargetRef, scrollContainerRef } = useAutoScroll(
		messages,
		isLoading,
	);

	if (!messages || messages.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center overflow-y-auto p-4">
				<div className="text-center text-muted-foreground">
					<Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p>Start a conversation by sending a message below.</p>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={scrollContainerRef}
			className="flex-1 space-y-4 overflow-y-auto p-4"
		>
			{messages.map((msg) => {
				if (msg.role === "system") return null;
				return (
					<div
						key={msg.id}
						className={cn(
							"flex gap-3",
							msg.role === "user" ? "justify-end" : "justify-start",
						)}
					>
						{msg.role === "assistant" && (
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
								<Bot className="h-4 w-4 text-primary-foreground" />
							</div>
						)}
						<div
							className={cn(
								"max-w-[80%] rounded-lg p-3",
								msg.role === "user"
									? "bg-primary text-primary-foreground"
									: "bg-muted",
							)}
						>
							{msg.role === "user" ? (
								<div className="whitespace-pre-wrap break-words">
									{msg.content}
								</div>
							) : (
								<MessageContent content={msg.content} />
							)}
							{msg.isStreaming && msg.role === "user" && (
								<div className="mt-2 flex items-center gap-1">
									<div className="flex space-x-1">
										<div className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
										<div className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
										<div className="h-1 w-1 animate-bounce rounded-full bg-current" />
									</div>
								</div>
							)}
							<div className="mt-2 text-xs opacity-70">
								{new Date(msg.createdAt).toLocaleTimeString()}
							</div>
						</div>
						{msg.role === "user" && (
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
								<User className="h-4 w-4" />
							</div>
						)}
					</div>
				);
			})}

			{errorMessage && (
				<div className="flex justify-start gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive">
						<AlertCircle className="h-4 w-4 text-destructive-foreground" />
					</div>
					<div className="max-w-[80%] rounded-lg border border-destructive/20 bg-destructive/10 p-3">
						<div className="flex items-start justify-between gap-2">
							<div className="whitespace-pre-wrap break-words text-destructive">
								{errorMessage}
							</div>
							{onClearError && (
								<Button
									onClick={onClearError}
									variant="ghost"
									className="flex-shrink-0 text-destructive hover:text-destructive/80"
									aria-label="Clear error"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
				</div>
			)}

			{isLoading && (
				<div className="flex justify-start gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
						<Bot className="h-4 w-4 text-primary-foreground" />
					</div>
					<div className="max-w-[80%] rounded-lg bg-muted p-3">
						<div className="flex items-center gap-1">
							<div className="flex space-x-1">
								<div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
								<div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
								<div className="h-2 w-2 animate-bounce rounded-full bg-current" />
							</div>
							<span className="ml-2 text-muted-foreground text-sm">
								AI is thinking...
							</span>
						</div>
					</div>
				</div>
			)}

			<div ref={scrollTargetRef} />
		</div>
	);
}
