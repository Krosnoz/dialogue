import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/providers/auth-provider";
import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

	return (
		<AuthProvider>
			<SidebarProvider defaultOpen={defaultOpen}>
				<AppSidebar />
				<SidebarInset>{children}</SidebarInset>
			</SidebarProvider>
		</AuthProvider>
	);
}
