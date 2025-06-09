"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";

import { Command } from "lucide-react";
import NextLink from "next/link";

export function NavMain() {
	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<NextLink href="/">
						<SidebarMenuButton
							tooltip="New Chat"
							className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
						>
							<Command className="size-4" />
							<span>New Chat</span>
						</SidebarMenuButton>
					</NextLink>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
