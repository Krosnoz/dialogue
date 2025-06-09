"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ConversationOutputs } from "@dialogue/api";
import { MessageSquare } from "lucide-react";
import NextLink from "next/link";
import { ConversationCard } from "./conversation-card";

interface ConversationsSectionProps {
	conversations?: ConversationOutputs["listByProject"];
	projectId: string;
}

export function ConversationsSection({
	conversations,
	projectId,
}: ConversationsSectionProps) {
	return (
		<div className="flex h-full flex-col space-y-4 p-4">
			<h2 className="font-semibold text-xl">Conversations</h2>
			{conversations && conversations.length > 0 ? (
				<div className="grid gap-4">
					{conversations.map((conversation) => (
						<ConversationCard
							key={conversation.id}
							id={conversation.id}
							projectId={projectId}
							title={conversation.title || "Untitled Chat"}
						/>
					))}
				</div>
			) : (
				<Card className="flex-1">
					<CardContent className="flex h-full flex-col items-center justify-center py-8">
						<MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-medium text-lg">No conversations yet</h3>
						<p className="mb-4 text-center text-muted-foreground">
							This project doesn't have any conversations yet. Start by adding
							conversations to this project.
						</p>
						<NextLink href="/">
							<Button>Go to Chats</Button>
						</NextLink>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
