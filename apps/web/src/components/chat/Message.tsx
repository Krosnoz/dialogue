"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LocalMessage } from "@/lib/db/local";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface MessageProps {
	message: LocalMessage;
	isStreaming?: boolean;
}

export function Message({ message, isStreaming = false }: MessageProps) {
	const isUser = message.role === "user";

	return (
		<div className={cn("group mb-6 flex gap-3", isUser && "flex-row-reverse")}>
			<Avatar className="h-8 w-8 shrink-0">
				<AvatarFallback
					className={cn(
						isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white",
					)}
				>
					{isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
				</AvatarFallback>
			</Avatar>

			<div className={cn("max-w-[80%] space-y-1", isUser && "text-right")}>
				<div
					className={cn(
						"inline-block rounded-lg px-4 py-2 text-sm",
						isUser ? "bg-blue-500 text-white" : "bg-muted text-foreground",
						isStreaming && "animate-pulse",
					)}
				>
					<div className="whitespace-pre-wrap break-words">
						{message.content}
						{isStreaming && (
							<span className="ml-1 inline-block h-4 w-2 animate-pulse bg-current" />
						)}
					</div>
				</div>

				<div
					className={cn(
						"px-1 text-muted-foreground text-xs",
						isUser && "text-right",
					)}
				>
					{message.createdAt.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
					{message.syncStatus === "pending" && (
						<span className="ml-1 text-yellow-500">⏳</span>
					)}
					{message.syncStatus === "failed" && (
						<span className="ml-1 text-red-500">❌</span>
					)}
				</div>
			</div>
		</div>
	);
}
