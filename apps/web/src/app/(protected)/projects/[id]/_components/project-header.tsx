"use client";

import { RenameProjectDialog } from "@/components/navigation/rename-project-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoldToDelete } from "@/components/ui/hold-to-delete";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useProjectOperations } from "@/hooks/use-project-operations";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface ProjectHeaderProps {
	projectId: string;
	title: string;
	description?: string | null;
}

export function ProjectHeader({
	projectId,
	title,
	description,
}: ProjectHeaderProps) {
	const { open, isMobile } = useSidebar();
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);

	const { deleteProject } = useProjectOperations();

	const handleDeleteProject = () => {
		deleteProject(projectId);
	};

	const handleRenameProject = () => {
		setRenameDialogOpen(true);
	};

	return (
		<>
			<div className="border-b p-4">
				<div className="flex items-center justify-between">
					<div className="mr-4 flex items-center">
						<SidebarTrigger className="mr-4" />
					</div>
					<div className="flex flex-col items-center gap-2">
						<h1 className="font-semibold text-2xl">
							{title || "Untitled Project"}
						</h1>
						{description && (
							<p className="text-muted-foreground text-sm">{description}</p>
						)}
					</div>
					{!open ? (
						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="size-7">
										<MoreHorizontal />
										<span className="sr-only">More options</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-24 rounded-lg"
									side={isMobile ? "bottom" : "right"}
									align={isMobile ? "end" : "start"}
								>
									<DropdownMenuItem onClick={handleRenameProject}>
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
											onDelete={handleDeleteProject}
											holdDuration={500}
											className="w-full px-2 py-1.5"
										>
											<span>Delete</span>
										</HoldToDelete>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : (
						<div />
					)}
				</div>
			</div>

			<RenameProjectDialog
				projectId={projectId}
				currentTitle={title}
				currentDescription={description}
				open={renameDialogOpen}
				onOpenChange={setRenameDialogOpen}
			/>
		</>
	);
}
