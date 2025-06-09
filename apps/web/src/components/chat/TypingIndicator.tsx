"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export function TypingIndicator() {
	return (
		<div className="mb-6 flex gap-3">
			<Avatar className="h-8 w-8 shrink-0">
				<AvatarFallback className="bg-green-500 text-white">
					<Bot className="h-4 w-4" />
				</AvatarFallback>
			</Avatar>

			<div className="rounded-lg bg-muted px-4 py-2 text-sm">
				<div className="flex items-center gap-1">
					<span>L'assistant écrit</span>
					<div className="flex gap-1">
						<div
							className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
							style={{ animationDelay: "0ms" }}
						/>
						<div
							className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
							style={{ animationDelay: "150ms" }}
						/>
						<div
							className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
							style={{ animationDelay: "300ms" }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
