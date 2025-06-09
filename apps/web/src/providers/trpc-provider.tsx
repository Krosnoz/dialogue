"use client";

import { TRPCProvider as TRPCProviderContext } from "@/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { type PropsWithChildren, useState } from "react";
import type { AppRouter } from "../../../server/src/routers/index";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});
}
let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

export function TRPCProvider({ children }: PropsWithChildren) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
					fetch(url, options) {
						return fetch(url, {
							...options,
							credentials: "include",
						});
					},
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProviderContext trpcClient={trpcClient} queryClient={queryClient}>
				{children}
				<ReactQueryDevtools initialIsOpen={false} />
			</TRPCProviderContext>
		</QueryClientProvider>
	);
}
