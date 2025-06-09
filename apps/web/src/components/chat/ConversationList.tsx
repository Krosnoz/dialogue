"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations } from "@/lib/hooks/useConversations";
import { useUIStore } from "@/lib/stores/ui";
import { cn } from "@/lib/utils";
import {
	Edit,
	Loader2,
	MessageSquare,
	MoreHorizontal,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";

export function ConversationList() {
	const { conversations, createConversation, deleteConversation, isCreating } =
		useConversations();

	const { currentConversationId, setCurrentConversationId, sidebarOpen } =
		useUIStore();

	const [isCreatingNew, setIsCreatingNew] = useState(false);
	const [newTitle, setNewTitle] = useState("");

	const handleCreateConversation = async () => {
		if (!newTitle.trim()) return;

		try {
			await createConversation(newTitle.trim());
			setNewTitle("");
			setIsCreatingNew(false);
		} catch (error) {
			console.error("Failed to create conversation:", error);
		}
	};

	const handleDeleteConversation = async (conversationId: string) => {
		try {
			await deleteConversation(conversationId);
			if (currentConversationId === conversationId) {
				setCurrentConversationId(null);
			}
		} catch (error) {
			console.error("Failed to delete conversation:", error);
		}
	};

	if (!sidebarOpen) {
		return null;
	}

	return (
		<Card className="flex h-full w-80 flex-col border-r">
			<div className="border-b p-4">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-lg">Conversations</h2>
					<Button
						size="sm"
						onClick={() => setIsCreatingNew(true)}
						disabled={isCreating}
					>
						{isCreating ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Plus className="h-4 w-4" />
						)}
					</Button>
				</div>

				{isCreatingNew && (
					<div className="space-y-2">
						<Input
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							placeholder="Titre de la conversation..."
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreateConversation();
								} else if (e.key === "Escape") {
									setIsCreatingNew(false);
									setNewTitle("");
								}
							}}
							autoFocus
						/>
						<div className="flex gap-2">
							<Button
								size="sm"
								onClick={handleCreateConversation}
								disabled={!newTitle.trim()}
							>
								Créer
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setIsCreatingNew(false);
									setNewTitle("");
								}}
							>
								Annuler
							</Button>
						</div>
					</div>
				)}
			</div>

			<ScrollArea className="flex-1">
				<div className="space-y-1 p-2">
					{conversations.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
							<p className="text-sm">Aucune conversation</p>
						</div>
					) : (
						conversations.map((conversation) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<div
								key={conversation.id}
								className={cn(
									"group flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-colors hover:bg-muted",
									currentConversationId === conversation.id && "bg-muted",
								)}
								onClick={() => setCurrentConversationId(conversation.id)}
							>
								<MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm">
										{conversation.title}
									</p>
									<p className="text-muted-foreground text-xs">
										{conversation.updatedAt.toLocaleDateString()}
									</p>
								</div>

								{conversation.syncStatus === "pending" && (
									<div className="h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
								)}

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
											onClick={(e) => e.stopPropagation()}
										>
											<MoreHorizontal className="h-3 w-3" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>
											<Edit className="mr-2 h-4 w-4" />
											Renommer
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDeleteConversation(conversation.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Supprimer
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						))
					)}
				</div>
			</ScrollArea>
		</Card>
	);
}
