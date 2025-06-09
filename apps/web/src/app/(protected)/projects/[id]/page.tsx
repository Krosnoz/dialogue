"use client";

import { useTRPC } from "@dialogue/api/client";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ConversationsSection } from "./_components/conversations-section";
import { ProjectHeader } from "./_components/project-header";

export default function ProjectPage({
	params,
}: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const trpc = useTRPC();

	try {
		z.string().uuid().parse(id);
	} catch (error) {
		redirect("/");
	}

	const {
		data: project,
		isLoading: isLoadingProject,
		isSuccess,
		isError,
		error,
	} = useQuery({
		...trpc.project.getById.queryOptions({ projectId: id }),
		retry: false,
	});

	const { data: conversations, isLoading: isLoadingConversations } = useQuery(
		trpc.conversation.listByProject.queryOptions({ projectId: id }),
	);

	if (!isSuccess && !isLoadingProject) {
		if (isError) {
			toast.error(error?.message, { id: "project-not-found" });
		}
		redirect("/");
	}

	if (isLoadingProject || isLoadingConversations) return null;

	return (
		<div className="flex h-[calc(100dvh-1rem)] flex-col">
			<ProjectHeader
				projectId={id}
				title={project?.title || "Untitled Project"}
				description={project?.description}
			/>
			<ConversationsSection projectId={id} conversations={conversations} />
		</div>
	);
}
