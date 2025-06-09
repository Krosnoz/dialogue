import { llmService } from "../../lib";
import type { Provider } from "./provider.dto";

const LLM_PROVIDERS = ["openai", "anthropic", "google"] as const;
type LLMProvider = (typeof LLM_PROVIDERS)[number];

export class ProviderService {
	list(): Provider[] {
		return [
			{
				id: "openai" as const,
				name: "OpenAI",
				models: this.getModelsByProvider("openai"),
				requiresApiKey: !llmService.hasGlobalApiKey("openai"),
			},
			{
				id: "anthropic" as const,
				name: "Anthropic",
				models: this.getModelsByProvider("anthropic"),
				requiresApiKey: !llmService.hasGlobalApiKey("anthropic"),
			},
			{
				id: "google" as const,
				name: "Google",
				models: this.getModelsByProvider("google"),
				requiresApiKey: !llmService.hasGlobalApiKey("google"),
			},
		];
	}

	private getModelsByProvider(provider: LLMProvider): string[] {
		switch (provider) {
			case "openai":
				return [
					"gpt-4.1",
					"gpt-4.1-mini",
					"gpt-4.1-nano",
					"gpt-4o",
					"gpt-4o-mini",
					"o3",
					"o3-mini",
				];
			case "anthropic":
				return [
					"claude-4-opus-20250514",
					"claude-4-sonnet-20250514",
					"claude-3-7-sonnet-20250219",
					"claude-3-5-sonnet-20241022",
				];
			case "google":
				return [
					"gemini-2.5-pro",
					"gemini-2.5-flash",
					"gemini-2.5-flash-lite-preview-06-17",
					"gemini-2.0-flash",
					"gemini-2.0-flash-lite",
				];
			default:
				return [];
		}
	}
}

export const providerService = new ProviderService();
