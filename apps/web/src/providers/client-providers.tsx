"use client";

import { TRPCProvider } from "@/providers/trpc-provider";
import { Toaster } from "../components/ui/sonner";
import { ThemeProvider } from "./theme-provider";

export default function ClientProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<TRPCProvider>{children}</TRPCProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
