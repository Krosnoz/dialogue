import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import NextLink from "next/link";

export default function NotFoundPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
							<AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
						</div>

						<div className="space-y-2">
							<h1 className="font-bold text-3xl tracking-tight">404</h1>
							<h2 className="font-semibold text-xl">Page Not Found</h2>
							<p className="text-muted-foreground">
								The page you're looking for doesn't exist or has been moved.
							</p>
						</div>

						<div className="flex gap-3 pt-4">
							<Button asChild variant="outline">
								<NextLink href="/">
									<Home className="h-4 w-4" />
									Home
								</NextLink>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
