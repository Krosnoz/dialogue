"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
							<AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
						</div>

						<div className="space-y-2">
							<h1 className="font-bold text-3xl tracking-tight">Oops!</h1>
							<h2 className="font-semibold text-xl">Something went wrong</h2>
							<p className="text-muted-foreground">
								An unexpected error occurred. Don't worry, it's not your fault.
							</p>
							{process.env.NODE_ENV === "development" && (
								<details className="mt-4 text-left">
									<summary className="cursor-pointer font-medium text-sm">
										Error Details (Dev Mode)
									</summary>
									<pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
										{error.message}
									</pre>
								</details>
							)}
						</div>

						<div className="flex gap-3 pt-4">
							<Button onClick={reset} variant="outline">
								<RefreshCw className="h-4 w-4" />
								Try Again
							</Button>
							<Button asChild>
								<Link href="/">
									<Home className="h-4 w-4" />
									Home
								</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
