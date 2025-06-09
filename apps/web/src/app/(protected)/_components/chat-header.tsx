"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import NextLink from "next/link";
import { SystemInstructionsDrawer } from "./system-instructions-drawer";

interface ChatHeaderProps {
	disabled: boolean;
	title: string;
	projectId?: string | null;
	projectTitle?: string | null;
	systemInstructions: string;
	onSystemInstructionsChange: (value: string) => void;
}

export function ChatHeader({
	disabled,
	title,
	projectId,
	projectTitle,
	systemInstructions,
	onSystemInstructionsChange,
}: ChatHeaderProps) {
	const { open } = useSidebar();

	return (
		<div className="border-b p-4">
			<div className="flex items-center justify-between">
				<div className="mr-4 flex items-center">
					<SidebarTrigger className="mr-4" />
					{!open && (
						<Tooltip>
							<TooltipTrigger asChild>
								<NextLink href="/">
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										title="New Chat"
									>
										<Plus />
										<span className="sr-only">New Chat</span>
									</Button>
								</NextLink>
							</TooltipTrigger>
							<TooltipContent>
								<p>New Chat</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
				<div className="flex flex-row items-stretch gap-4">
					<h1 className="font-semibold text-2xl">{title}</h1>
					{projectTitle && projectId && (
						<Badge variant="secondary">
							<NextLink href={`/projects/${projectId}`}>
								{projectTitle}
							</NextLink>
						</Badge>
					)}
				</div>
				<SystemInstructionsDrawer
					disabled={disabled}
					systemInstructions={systemInstructions}
					onSystemInstructionsChange={onSystemInstructionsChange}
				/>
			</div>
		</div>
	);
}
