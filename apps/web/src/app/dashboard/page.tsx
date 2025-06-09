"use client";

import { ChatView } from "@/components/chat/ChatView";
import { ConversationList } from "@/components/chat/ConversationList";
import { ProjectList } from "@/components/chat/ProjectList";
import { Button } from "@/components/ui/button";
import { useSync } from "@/lib/hooks/useSync";
import { useUIStore } from "@/lib/stores/ui";
import { Menu } from "lucide-react";

export default function DashboardPage() {
	const { sidebarOpen, toggleSidebar, currentProjectId } = useUIStore();
	useSync(); // Initialize global sync

	return (
		<div className="flex h-screen flex-col">
			{/* Header */}
			<header className="flex items-center gap-4 border-b bg-background p-4">
				<Button
					size="sm"
					variant="ghost"
					onClick={toggleSidebar}
					className="lg:hidden"
				>
					<Menu className="h-4 w-4" />
				</Button>

				<h1 className="font-semibold text-xl">Dialogue</h1>

				<div className="ml-auto flex items-center gap-2">
					{/* Future action buttons (profile, settings, etc.) */}
				</div>
			</header>

			{/* Main content */}
			<div className="flex flex-1 overflow-hidden">
				{sidebarOpen && <ProjectList />}
				{sidebarOpen && currentProjectId && (
					<ConversationList projectId={currentProjectId} />
				)}
				<ChatView />
			</div>
		</div>
	);
}
