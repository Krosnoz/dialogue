"use client";

import { ChatContainer } from "./_components/chat-container";

export default function DashboardPage() {
	return (
		<div className="flex h-[calc(100dvh-1rem)] flex-col">
			<ChatContainer />
		</div>
	);
}
