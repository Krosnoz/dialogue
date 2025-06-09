import { QueryCache, QueryClient } from "@tanstack/react-query";
import {
	createTRPCClient,
	createWSClient,
	httpBatchLink,
	splitLink,
	wsLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";
import type { AppRouter } from "../../../server/src/routers/index";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

function getWsUrl() {
	const wsProtocol = process.env.NODE_ENV === "production" ? "wss:" : "ws:";
	const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || "localhost:3001";
	return `${wsProtocol}//${wsBaseUrl}/trpc`;
}

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		splitLink({
			condition: (op) => op.type === "subscription",
			true: wsLink({
				client: createWSClient({
					url: getWsUrl(),
				}),
			}),
			false: httpBatchLink({
				url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
				fetch(url, options) {
					return fetch(url, {
						...options,
						credentials: "include",
					});
				},
			}),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
