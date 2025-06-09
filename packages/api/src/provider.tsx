"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createTRPCClient,
	httpBatchStreamLink,
	httpSubscriptionLink,
	splitLink,
} from "@trpc/client";
import { TRPCProvider as TRPCProviderContext } from "./client";

import { type PropsWithChildren, useState } from "react";
import type { AppRouter } from "..";

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
				splitLink({
					condition: (op) => op.type === "subscription",
					true: httpSubscriptionLink({
						url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
						eventSourceOptions() {
							return {
								withCredentials: true,
							};
						},
					}),
					false: httpBatchStreamLink({
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
