"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { HoldToDelete } from "@/components/ui/hold-to-delete";
import { useTRPC } from "@dialogue/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ConversationCardProps {
	id: string;
	title?: string;
	projectId: string;
}

export function ConversationCard({
	id,
	title,
	projectId,
}: ConversationCardProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { mutate: removeConversationFromProject } = useMutation({
		...trpc.conversation.removeFromProject.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.conversation.listByProject.queryOptions({
						projectId,
					}),
				);
				await queryClient.invalidateQueries(
					trpc.conversation.listAll.queryOptions(),
				);
				toast.success("Conversation removed from project");
			},
		}),
	});

	const handleRemoveFromProject = () => {
		removeConversationFromProject({
			conversationId: id,
			projectId,
		});
	};

	return (
		<Card className="transition-colors hover:bg-accent/50">
			<CardContent className="flex flex-row items-center justify-between">
				<NextLink href={`/chat/${id}`}>
					<CardTitle className="flex items-center gap-2 text-base">
						<MessageSquare className="h-4 w-4" />
						{title || "Untitled Chat"}
					</CardTitle>
				</NextLink>
				<div className="flex items-center justify-between gap-4">
					<HoldToDelete
						onDelete={handleRemoveFromProject}
						holdDuration={500}
						className="w-full overflow-hidden rounded-md border px-2.5 py-1.5 text-sm"
					>
						<span>Remove from Project</span>
					</HoldToDelete>
				</div>
			</CardContent>
		</Card>
	);
}
