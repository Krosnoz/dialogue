"use client";

import { useTRPC } from "@dialogue/api/client";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Collapsible } from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoldToDelete } from "@/components/ui/hold-to-delete";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AddToProjectDialog } from "./add-to-project-dialog";
import { RenameConversationDialog } from "./rename-conversation-dialog";

export function NavChats() {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const pathname = usePathname();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [addToProjectDialogOpen, setAddToProjectDialogOpen] = useState(false);
	const [selectedConversation, setSelectedConversation] = useState<{
		id: string;
		title: string;
	} | null>(null);

	const { data: conversations, isLoading } = useQuery(
		trpc.conversation.listAll.queryOptions(),
	);

	const deleteMutation = useMutation(
		trpc.conversation.delete.mutationOptions({
			onSuccess: async (_, variables) => {
				await queryClient.invalidateQueries(
					trpc.conversation.listAll.queryOptions(),
				);
				await queryClient.invalidateQueries(
					trpc.conversation.getById.queryOptions({
						conversationId: variables.conversationId,
					}),
				);

				if (pathname === `/chat/${variables.conversationId}`) {
					router.push("/");
				}

				toast.success("Chat deleted successfully");
			},
			onError: (error) => {
				toast.error(`Failed to delete chat: ${error.message}`);
			},
		}),
	);

	const handleDeleteConversation = (conversationId: string) => {
		deleteMutation.mutate({ conversationId });
	};

	const handleRenameConversation = (conversationId: string, title: string) => {
		setSelectedConversation({ id: conversationId, title });
		setRenameDialogOpen(true);
	};

	const handleAddToProject = (conversationId: string, title: string) => {
		setSelectedConversation({ id: conversationId, title });
		setAddToProjectDialogOpen(true);
	};

	if (isLoading) {
		return (
			<SidebarGroup>
				<SidebarGroupLabel>Chats</SidebarGroupLabel>
				<SidebarMenu>
					{Array.from({ length: 3 }).map((_, i) => (
						<SidebarMenuItem key={i}>
							<Skeleton className="h-8 w-full" />
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroup>
		);
	}

	if (!conversations || conversations.length === 0) {
		return (
			<SidebarGroup>
				<SidebarGroupLabel>Chats</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="px-2 py-1 text-muted-foreground text-sm">
							No chats yet
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		);
	}

	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel>Chats</SidebarGroupLabel>
				<SidebarMenu>
					{conversations?.map((conversation) => (
						<Collapsible key={conversation.id} asChild defaultOpen={false}>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									tooltip={conversation.title || "Untitled Chat"}
									isActive={pathname === `/chat/${conversation.id}`}
								>
									<NextLink href={`/chat/${conversation.id}`}>
										<span>{conversation.title || "Untitled Chat"}</span>
									</NextLink>
								</SidebarMenuButton>
								{/* Dropdown menu */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuAction
											showOnHover
											className="rounded-sm data-[state=open]:bg-accent"
										>
											<MoreHorizontal />
											<span className="sr-only">More</span>
										</SidebarMenuAction>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-48 rounded-lg"
										side={isMobile ? "bottom" : "right"}
										align={isMobile ? "end" : "start"}
									>
										<DropdownMenuItem
											onClick={() =>
												handleAddToProject(
													conversation.id,
													conversation.title || "Untitled Chat",
												)
											}
										>
											Add to project
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												handleRenameConversation(
													conversation.id,
													conversation.title || "",
												)
											}
										>
											<span>Rename</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											className="p-0"
											onClick={(e) => {
												e.preventDefault();
											}}
										>
											<HoldToDelete
												onDelete={() =>
													handleDeleteConversation(conversation.id)
												}
												holdDuration={500}
												className="w-full px-2 py-1.5"
											>
												<span>Delete</span>
											</HoldToDelete>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</Collapsible>
					))}
				</SidebarMenu>
			</SidebarGroup>

			{/* Dialogs */}
			{selectedConversation && (
				<>
					<RenameConversationDialog
						conversationId={selectedConversation.id}
						currentTitle={selectedConversation.title}
						open={renameDialogOpen}
						onOpenChange={setRenameDialogOpen}
					/>
					<AddToProjectDialog
						conversationId={selectedConversation.id}
						open={addToProjectDialogOpen}
						onOpenChange={setAddToProjectDialogOpen}
					/>
				</>
			)}
		</>
	);
}
