"use client";

import { ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@dialogue/auth/client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export function NavUser() {
	const router = useRouter();
	const { isMobile } = useSidebar();
	const { theme, setTheme } = useTheme();

	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-12 w-full" />;
	}

	if (!session) {
		return null;
	}

	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/auth/signin");
				},
			},
		});
	};

	const handleThemeChange = (theme: string) => {
		setTheme(theme);
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={session.user.image ?? undefined}
									alt={session.user.name}
								/>
								<AvatarFallback className="rounded-lg">
									{session.user.name?.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{session.user.name}
								</span>
								<span className="truncate text-xs">{session.user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={session.user.image ?? undefined}
										alt={session.user.name}
									/>
									<AvatarFallback className="rounded-lg">
										{session.user.name?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{session.user.name}
									</span>
									<span className="truncate text-xs">{session.user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>Account</DropdownMenuItem>
							<DropdownMenuItem>Billing</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent collisionPadding={{ bottom: 24 }}>
										<DropdownMenuRadioGroup
											value={theme}
											onValueChange={handleThemeChange}
										>
											<DropdownMenuRadioItem value="light">
												Light
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="dark">
												Dark
											</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="system">
												System
											</DropdownMenuRadioItem>
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut} variant="destructive">
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
