import { protectedProcedure, router } from "@dialogue/api/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { ProvidersResultDto } from "./provider.dto";
import { providerService } from "./provider.service";

export const providerRouter = router({
	list: protectedProcedure.query(async (): Promise<ProvidersResultDto> => {
		const providers = providerService.list();
		return {
			items: providers,
			itemsCount: providers.length,
		};
	}),
});

export type ProviderRouter = typeof providerRouter;
export type ProviderInputs = inferRouterInputs<ProviderRouter>;
export type ProviderOutputs = inferRouterOutputs<ProviderRouter>;
