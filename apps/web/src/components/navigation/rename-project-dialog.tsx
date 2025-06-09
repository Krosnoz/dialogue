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
import { Textarea } from "@/components/ui/textarea";
import { useProjectOperations } from "@/hooks/use-project-operations";
import { useState } from "react";

interface RenameProjectDialogProps {
	projectId: string;
	currentTitle: string;
	currentDescription?: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RenameProjectDialog({
	projectId,
	currentTitle,
	currentDescription,
	open,
	onOpenChange,
}: RenameProjectDialogProps) {
	const [title, setTitle] = useState(currentTitle || "");
	const [description, setDescription] = useState(currentDescription || "");

	const { renameProject, isRenaming } = useProjectOperations({
		onRenameSuccess: () => {
			onOpenChange(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		renameProject(projectId, title.trim(), description.trim() || undefined);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Rename Project</DialogTitle>
					<DialogDescription>
						Update the project name and description.
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
								placeholder="Enter project title"
								autoFocus
							/>
						</div>
						<div className="grid grid-cols-4 items-start gap-4">
							<Label htmlFor="description" className="pt-2 text-right">
								Description
							</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="col-span-3"
								placeholder="Enter project description (optional)"
								rows={3}
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
						<Button type="submit" disabled={!title.trim() || isRenaming}>
							{isRenaming ? "Updating..." : "Update"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
