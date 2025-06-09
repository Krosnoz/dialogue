import { z } from "zod";

export const providerSchema = z.object({
	id: z.string(),
	name: z.string(),
	models: z.array(z.string()),
	requiresApiKey: z.boolean(),
});

export const providersResultSchema = z.object({
	items: z.array(providerSchema),
	itemsCount: z.number(),
});

export type ProvidersResultDto = z.infer<typeof providersResultSchema>;
export type Provider = z.infer<typeof providerSchema>;
