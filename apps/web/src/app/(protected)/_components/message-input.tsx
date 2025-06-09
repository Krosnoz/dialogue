"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ModelSelector } from "./model-selector";

type MessageInputProps = {
	onSendMessage: (message: string) => void;
	disabled?: boolean;
};

export interface MessageInputRef {
	focus: () => void;
}

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(
	({ onSendMessage, disabled = false }, ref) => {
		const textareaRef = useRef<HTMLTextAreaElement>(null);
		const [message, setMessage] = useState("");

		useImperativeHandle(ref, () => ({
			focus: () => {
				textareaRef.current?.focus();
			},
		}));

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey && !disabled) {
				e.preventDefault();
				handleSend();
			}
		};

		const handleClick = () => {
			if (!disabled) {
				handleSend();
			}
		};

		const handleSend = () => {
			if (message.trim()) {
				onSendMessage(message.trim());
				setMessage("");
			}
		};

		const onMessageChange = (message: string) => {
			if (!disabled) {
				setMessage(message);
			}
		};

		return (
			<div className="border-t p-4">
				<div className="space-y-2">
					<div className="flex flex-col gap-2">
						<Textarea
							ref={textareaRef}
							placeholder={
								disabled
									? "Waiting for AI response..."
									: "Type your message... (Enter to send, Shift+Enter for new line)"
							}
							value={message}
							onChange={(e) => onMessageChange(e.target.value)}
							onKeyDown={handleKeyDown}
							className="max-h-[200px] min-h-[60px] resize-none pr-12"
							disabled={disabled}
						/>
						<div className="flex justify-between gap-2">
							<ModelSelector />
							<Button
								onClick={handleClick}
								disabled={disabled || !message.trim()}
								size="icon"
							>
								<Send />
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

MessageInput.displayName = "MessageInput";
