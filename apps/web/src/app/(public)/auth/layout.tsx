import { AuthProvider } from "@/providers/auth-provider";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
	title: {
		template: "%s | Dialogue",
		default: "Authentication | Dialogue",
	},
	description:
		"Sign in or create an account to access Dialogue - The AI conversation platform",
};

export default function AuthLayout({ children }: PropsWithChildren) {
	return (
		<AuthProvider isPublic>
			<div className="min-h-screen bg-background">{children}</div>
		</AuthProvider>
	);
}
