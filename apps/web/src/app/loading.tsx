import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function LoadingPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="rounded-full bg-primary/10 p-3">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>

						<div className="w-full space-y-2">
							<div className="text-center">
								<h2 className="font-semibold text-xl">Loading...</h2>
								<p className="text-muted-foreground text-sm">
									Please wait while we prepare your content
								</p>
							</div>

							<div className="space-y-3 pt-4">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
