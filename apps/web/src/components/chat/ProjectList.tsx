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
import { useProjects } from "@/lib/hooks/useProjects";
import { useUIStore } from "@/lib/stores/ui";
import { cn } from "@/lib/utils";
import {
	Edit,
	FolderOpen,
	Loader2,
	MoreHorizontal,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";

export function ProjectList() {
	const { projects, createProject, deleteProject, isCreating } = useProjects();
	const { currentProjectId, setCurrentProjectId } = useUIStore();

	const [isCreatingNew, setIsCreatingNew] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");

	const handleCreateProject = async () => {
		if (!newTitle.trim()) return;

		try {
			await createProject(newTitle.trim(), newDescription.trim() || undefined);
			setNewTitle("");
			setNewDescription("");
			setIsCreatingNew(false);
		} catch (error) {
			console.error("Failed to create project:", error);
		}
	};

	const handleDeleteProject = async (projectId: string) => {
		try {
			await deleteProject(projectId);
			if (currentProjectId === projectId) {
				setCurrentProjectId(null);
			}
		} catch (error) {
			console.error("Failed to delete project:", error);
		}
	};

	return (
		<Card className="flex h-full w-80 flex-col border-r">
			<div className="border-b p-4">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-lg">Projects</h2>
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
							placeholder="Project title..."
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreateProject();
								} else if (e.key === "Escape") {
									setIsCreatingNew(false);
									setNewTitle("");
									setNewDescription("");
								}
							}}
							autoFocus
						/>
						<Input
							value={newDescription}
							onChange={(e) => setNewDescription(e.target.value)}
							placeholder="Description (optional)..."
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreateProject();
								} else if (e.key === "Escape") {
									setIsCreatingNew(false);
									setNewTitle("");
									setNewDescription("");
								}
							}}
						/>
						<div className="flex gap-2">
							<Button
								size="sm"
								onClick={handleCreateProject}
								disabled={!newTitle.trim()}
							>
								Create
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setIsCreatingNew(false);
									setNewTitle("");
									setNewDescription("");
								}}
							>
								Cancel
							</Button>
						</div>
					</div>
				)}
			</div>

			<ScrollArea className="flex-1">
				<div className="space-y-1 p-2">
					{projects.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
							<p className="text-sm">No projects</p>
						</div>
					) : (
						projects.map((project) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<div
								key={project.id}
								className={cn(
									"group flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-colors hover:bg-muted",
									currentProjectId === project.id && "bg-muted",
								)}
								onClick={() => setCurrentProjectId(project.id)}
							>
								<FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />

								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm">
										{project.title}
									</p>
									{project.description && (
										<p className="truncate text-muted-foreground text-xs">
											{project.description}
										</p>
									)}
									<p className="text-muted-foreground text-xs">
										{project.updatedAt.toLocaleDateString()}
									</p>
								</div>

								{project.syncStatus === "pending" && (
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
											Rename
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDeleteProject(project.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
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
