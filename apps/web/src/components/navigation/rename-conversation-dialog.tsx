"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@dialogue/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface RenameConversationDialogProps {
	conversationId: string;
	currentTitle: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RenameConversationDialog({
	conversationId,
	currentTitle,
	open,
	onOpenChange,
}: RenameConversationDialogProps) {
	const [title, setTitle] = useState(currentTitle || "");
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const renameMutation = useMutation(
		trpc.conversation.rename.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.conversation.listAll.queryOptions(),
				);
				await queryClient.invalidateQueries(
					trpc.conversation.getById.queryOptions({
						conversationId,
					}),
				);
				toast.success("Conversation renamed successfully");
				onOpenChange(false);
			},
			onError: (error) => {
				toast.error(`Failed to rename conversation: ${error.message}`);
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		renameMutation.mutate({
			conversationId,
			title: title.trim(),
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Rename Conversation</DialogTitle>
					<DialogDescription>
						Enter a new name for this conversation.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="title" className="text-right">
								Title
							</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="col-span-3"
								placeholder="Enter conversation title"
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!title.trim() || renameMutation.isPending}
						>
							{renameMutation.isPending ? "Renaming..." : "Rename"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
