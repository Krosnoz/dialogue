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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@dialogue/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface AddToProjectDialogProps {
	conversationId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddToProjectDialog({
	conversationId,
	open,
	onOpenChange,
}: AddToProjectDialogProps) {
	const [selectedProjectId, setSelectedProjectId] = useState<string>("");
	const [newProjectTitle, setNewProjectTitle] = useState("");
	const [newProjectDescription, setNewProjectDescription] = useState("");
	const [mode, setMode] = useState<"existing" | "new">("existing");

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: projects, isLoading: isLoadingProjects } = useQuery(
		trpc.project.listRecent.queryOptions(),
	);

	const addToExistingMutation = useMutation(
		trpc.conversation.addToProject.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.conversation.listAll.queryOptions(),
				);
				await queryClient.invalidateQueries(
					trpc.conversation.getById.queryOptions({
						conversationId,
					}),
				);
				toast.success("Conversation added to project successfully");
				onOpenChange(false);
				resetForm();
			},
			onError: (error) => {
				toast.error(`Failed to add conversation to project: ${error.message}`);
			},
		}),
	);

	const createProjectMutation = useMutation(
		trpc.conversation.createProjectWithConversation.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					trpc.project.listRecent.queryOptions(),
				);
				await queryClient.invalidateQueries(
					trpc.conversation.listAll.queryOptions(),
				);
				await queryClient.invalidateQueries(
					trpc.conversation.getById.queryOptions({
						conversationId,
					}),
				);
				toast.success("Project created and conversation added successfully");
				onOpenChange(false);
				resetForm();
			},
			onError: (error) => {
				toast.error(`Failed to create project: ${error.message}`);
			},
		}),
	);

	const resetForm = () => {
		setSelectedProjectId("");
		setNewProjectTitle("");
		setNewProjectDescription("");
		setMode("existing");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (mode === "existing") {
			if (!selectedProjectId) return;
			addToExistingMutation.mutate({
				conversationId,
				projectId: selectedProjectId,
			});
		} else {
			if (!newProjectTitle.trim()) return;
			createProjectMutation.mutate({
				conversationId,
				title: newProjectTitle.trim(),
				description: newProjectDescription.trim() || undefined,
			});
		}
	};

	const isPending =
		addToExistingMutation.isPending || createProjectMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add to Project</DialogTitle>
					<DialogDescription>
						Add this conversation to an existing project or create a new one.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-6 py-4">
						{/* Mode Selection */}
						<div className="flex gap-2">
							<Button
								type="button"
								variant={mode === "existing" ? "default" : "outline"}
								size="sm"
								onClick={() => setMode("existing")}
								className="flex-1"
							>
								Existing Project
							</Button>
							<Button
								type="button"
								variant={mode === "new" ? "default" : "outline"}
								size="sm"
								onClick={() => setMode("new")}
								className="flex-1"
							>
								New Project
							</Button>
						</div>

						<Separator />

						{mode === "existing" ? (
							<div className="space-y-4">
								<Label htmlFor="project">Select Project</Label>
								{isLoadingProjects ? (
									<div className="text-muted-foreground text-sm">
										Loading projects...
									</div>
								) : projects && projects.length > 0 ? (
									<Select
										value={selectedProjectId}
										onValueChange={setSelectedProjectId}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Choose a project" />
										</SelectTrigger>
										<SelectContent>
											{projects.map((project) => (
												<SelectItem key={project.id} value={project.id}>
													{project.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : (
									<div className="text-muted-foreground text-sm">
										No projects found. Create a new project instead.
									</div>
								)}
							</div>
						) : (
							<div className="space-y-4">
								<div className="space-y-4">
									<Label htmlFor="title">Project Title</Label>
									<Input
										id="title"
										value={newProjectTitle}
										onChange={(e) => setNewProjectTitle(e.target.value)}
										placeholder="Enter project title"
										autoFocus
									/>
								</div>
								<div className="space-y-4">
									<Label htmlFor="description">Description (Optional)</Label>
									<Input
										id="description"
										value={newProjectDescription}
										onChange={(e) => setNewProjectDescription(e.target.value)}
										placeholder="Enter project description"
									/>
								</div>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onOpenChange(false);
								resetForm();
							}}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								isPending ||
								(mode === "existing" && !selectedProjectId) ||
								(mode === "new" && !newProjectTitle.trim())
							}
						>
							{isPending
								? mode === "existing"
									? "Adding..."
									: "Creating..."
								: mode === "existing"
									? "Add to Project"
									: "Create Project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
