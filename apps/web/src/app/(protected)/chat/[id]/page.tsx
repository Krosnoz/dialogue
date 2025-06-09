"use client";

import { ChatContainer } from "@/app/(protected)/_components/chat-container";
import { useTRPC } from "@dialogue/api/client";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { z } from "zod";

export default function ChatPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const trpc = useTRPC();
	try {
		z.string().uuid().parse(id);
	} catch (error) {
		redirect("/");
	}

	const {
		data: conversation,
		isLoading: isLoadingConversation,
		isSuccess,
		isError,
		error,
	} = useQuery({
		...trpc.conversation.getById.queryOptions({
			conversationId: id,
		}),
		enabled: !!id,
		retry: false,
	});

	if (!isSuccess && !isLoadingConversation) {
		if (isError) {
			toast.error(error.message, { id: "conversation-not-found" });
		}
		redirect("/");
	}

	if (isLoadingConversation) return null;

	return (
		<div className="flex h-[calc(100dvh-1rem)] flex-col">
			<ChatContainer conversation={conversation} />
		</div>
	);
}
