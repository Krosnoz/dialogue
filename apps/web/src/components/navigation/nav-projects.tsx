"use client";

import { useTRPC } from "@dialogue/api/client";
import { Folder, MoreHorizontal } from "lucide-react";

import { Collapsible } from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
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
import { useProjectOperations } from "@/hooks/use-project-operations";
import { useQuery } from "@tanstack/react-query";
import NextLink from "next/link";
import { useState } from "react";
import { RenameProjectDialog } from "./rename-project-dialog";

export function NavProjects() {
	const { isMobile } = useSidebar();
	const trpc = useTRPC();

	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<{
		id: string;
		title: string;
		description?: string | null;
	} | null>(null);

	const { data: projects, isLoading } = useQuery(
		trpc.project.listRecent.queryOptions(),
	);

	const { deleteProject } = useProjectOperations();

	const handleDeleteProject = (projectId: string) => {
		deleteProject(projectId);
	};

	const handleRenameProject = (
		projectId: string,
		title: string,
		description?: string | null,
	) => {
		setSelectedProject({ id: projectId, title, description });
		setRenameDialogOpen(true);
	};

	if (isLoading) {
		return (
			<SidebarGroup>
				<SidebarGroupLabel>Projects</SidebarGroupLabel>
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

	if (!projects || projects.length === 0) {
		return (
			<SidebarGroup>
				<SidebarGroupLabel>Projects</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="px-2 py-1 text-muted-foreground text-sm">
							No projects yet
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		);
	}

	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel>Projects</SidebarGroupLabel>
				<SidebarMenu>
					{projects.map((project) => (
						<Collapsible key={project.id} asChild defaultOpen={false}>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									tooltip={project.title}
									isActive={false}
								>
									<NextLink href={`/projects/${project.id}`}>
										<Folder />
										<span>{project.title}</span>
									</NextLink>
								</SidebarMenuButton>
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
										className="w-24 rounded-lg"
										side={isMobile ? "bottom" : "right"}
										align={isMobile ? "end" : "start"}
									>
										<DropdownMenuItem
											onClick={() =>
												handleRenameProject(
													project.id,
													project.title,
													project.description,
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
												onDelete={() => handleDeleteProject(project.id)}
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

			{/* Rename Dialog */}
			{selectedProject && (
				<RenameProjectDialog
					projectId={selectedProject.id}
					currentTitle={selectedProject.title}
					currentDescription={selectedProject.description}
					open={renameDialogOpen}
					onOpenChange={setRenameDialogOpen}
				/>
			)}
		</>
	);
}
