"use client";

import { useTRPC } from "@dialogue/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProjectOperationsOptions {
	onDeleteSuccess?: (projectId: string) => void;
	onRenameSuccess?: (projectId: string) => void;
}

export function useProjectOperations(options: ProjectOperationsOptions = {}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const router = useRouter();
	const pathname = usePathname();

	const deleteMutation = useMutation(
		trpc.project.delete.mutationOptions({
			onSuccess: async (_, variables) => {
				if (pathname.includes(`/projects/${variables.projectId}`)) {
					router.push("/");
				}

				await queryClient.invalidateQueries(trpc.project.list.queryOptions());
				await queryClient.invalidateQueries(
					trpc.project.listRecent.queryOptions(),
				);

				await queryClient.invalidateQueries(
					trpc.conversation.listAll.queryOptions(),
				);
				await queryClient.invalidateQueries(
					trpc.conversation.listByProject.queryOptions({
						projectId: variables.projectId,
					}),
				);

				options.onDeleteSuccess?.(variables.projectId);
				toast.success("Project deleted successfully");
			},
			onError: (error) => {
				toast.error(`Failed to delete project: ${error.message}`);
			},
		}),
	);

	const renameMutation = useMutation(
		trpc.project.rename.mutationOptions({
			onSuccess: async (_, variables) => {
				await queryClient.invalidateQueries(trpc.project.list.queryOptions());
				await queryClient.invalidateQueries(
					trpc.project.listRecent.queryOptions(),
				);
				await queryClient.invalidateQueries(
					trpc.project.getById.queryOptions({
						projectId: variables.projectId,
					}),
				);

				options.onRenameSuccess?.(variables.projectId);
				toast.success("Project renamed successfully");
			},
			onError: (error) => {
				toast.error(`Failed to rename project: ${error.message}`);
			},
		}),
	);

	return {
		deleteProject: (projectId: string) => {
			deleteMutation.mutate({ projectId });
		},
		renameProject: (projectId: string, title: string, description?: string) => {
			renameMutation.mutate({ projectId, title, description });
		},
		isDeleting: deleteMutation.isPending,
		isRenaming: renameMutation.isPending,
	};
}
