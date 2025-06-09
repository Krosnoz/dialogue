import { type LocalProject, localDb } from "@/lib/db/local";
import { useUIStore } from "@/lib/stores/ui";
import { useTRPC } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import { useSync } from "./useSync";

export function useProjects() {
	const { setCurrentProjectId } = useUIStore();
	const trpc = useTRPC();
	const sync = useSync();

	const localProjects = useLiveQuery(
		() => localDb.projects.orderBy("updatedAt").reverse().toArray(),
		[],
	);

	const createProjectMutation = useMutation(
		trpc.chat.createProject.mutationOptions({
			onSuccess: async (newProject) => {
				await localDb.projects.put({
					id: newProject.id,
					userId: newProject.userId,
					title: newProject.title,
					description: newProject.description,
					settings: newProject.settings,
					isArchived: newProject.isArchived,
					createdAt: new Date(newProject.createdAt),
					updatedAt: new Date(newProject.updatedAt),
					syncStatus: "synced",
				});

				setCurrentProjectId(newProject.id);
			},
		}),
	);

	const deleteProjectMutation = useMutation(
		trpc.chat.deleteProject.mutationOptions({
			onSuccess: async (_, variables: { projectId: string }) => {
				await localDb.projects.delete(variables.projectId);
				await localDb.conversations
					.where("projectId")
					.equals(variables.projectId)
					.delete();
				await localDb.messages
					.where("conversationId")
					.anyOf(
						await localDb.conversations
							.where("projectId")
							.equals(variables.projectId)
							.primaryKeys(),
					)
					.delete();
			},
		}),
	);

	const createProject = useCallback(
		async (title: string, description?: string) => {
			try {
				const tempId = `temp-${Date.now()}`;
				const tempProject: LocalProject = {
					id: tempId,
					userId: "temp-user",
					title,
					description: description || null,
					settings: null,
					isArchived: false,
					createdAt: new Date(),
					updatedAt: new Date(),
					syncStatus: "pending",
				};

				await localDb.projects.put(tempProject);
				setCurrentProjectId(tempId);

				const result = await createProjectMutation.mutateAsync({
					title,
					description,
				});

				await localDb.projects.delete(tempId);

				return result;
			} catch (error) {
				console.error("Failed to create project:", error);
				throw error;
			}
		},
		[createProjectMutation, setCurrentProjectId],
	);

	const deleteProject = useCallback(
		async (projectId: string) => {
			try {
				await deleteProjectMutation.mutateAsync({ projectId });
			} catch (error) {
				console.error("Failed to delete project:", error);
				throw error;
			}
		},
		[deleteProjectMutation],
	);

	return {
		projects: localProjects || [],
		createProject,
		deleteProject,
		isCreating: createProjectMutation.isPending,
		isDeleting: deleteProjectMutation.isPending,
		sync,
	};
}
