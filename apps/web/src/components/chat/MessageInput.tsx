"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MessageInputProps {
	onSendMessage: (content: string) => Promise<void>;
	disabled?: boolean;
}

export function MessageInput({
	onSendMessage,
	disabled = false,
}: MessageInputProps) {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();

		if (!content.trim() || disabled || isSubmitting) return;

		const messageContent = content.trim();
		setContent("");
		setIsSubmitting(true);

		try {
			await onSendMessage(messageContent);
		} catch (error) {
			console.error("Failed to send message:", error);
			setContent(messageContent);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [content]);

	const isDisabled = disabled || isSubmitting;

	return (
		<form onSubmit={handleSubmit} className="flex items-end gap-2">
			<div className="relative flex-1">
				<Textarea
					ref={textareaRef}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
					disabled={isDisabled}
					className="max-h-32 min-h-[44px] resize-none pr-12"
					rows={1}
				/>
			</div>

			<Button
				type="submit"
				size="icon"
				disabled={isDisabled || !content.trim()}
				className="h-11 w-11 shrink-0"
			>
				{isSubmitting ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Send className="h-4 w-4" />
				)}
			</Button>
		</form>
	);
}
