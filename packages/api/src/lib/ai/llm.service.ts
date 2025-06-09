import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { AppError } from "@dialogue/api/errors";
import type { LLMProvider } from "@dialogue/types";
import { streamText } from "ai";
import { config } from "../../config";

export class LLMService {
	private getModel(provider: LLMProvider, model: string, apiKey?: string) {
		switch (provider) {
			case "openai":
				return createOpenAI({
					apiKey: apiKey || config.OPENAI_API_KEY,
				}).chat(model);
			case "anthropic":
				return createAnthropic({
					apiKey: apiKey || config.ANTHROPIC_API_KEY,
				})(model);
			case "google":
				return createGoogleGenerativeAI({
					apiKey: apiKey || config.GOOGLE_API_KEY,
				}).chat(model);
			default:
				throw AppError.badRequest(
					`Unsupported provider: ${provider}`,
				).toTRPCError();
		}
	}
	async streamResponse(
		provider: LLMProvider,
		model: string,
		messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
		options?: {
			apiKey?: string;
		},
	) {
		if (!this.validateApiKey(provider, options?.apiKey)) {
			throw AppError.unauthorized(
				`Invalid or missing API key for ${provider} provider`,
			).toTRPCError();
		}

		try {
			const aiModel = this.getModel(provider, model, options?.apiKey);

			const result = await streamText({
				model: aiModel,
				messages,
			});

			return result;
		} catch (error) {
			if (error instanceof Error) {
				if (error?.message?.includes("API key")) {
					throw AppError.unauthorized(
						`Invalid API key for ${provider} provider`,
					).toTRPCError();
				}

				if (error?.message?.includes("model")) {
					throw AppError.badRequest(
						`Invalid model "${model}" for ${provider} provider`,
					).toTRPCError();
				}

				if (error?.message?.includes("rate limit")) {
					throw AppError.badRequest(
						`Rate limit exceeded for ${provider} provider`,
					).toTRPCError();
				}

				throw AppError.badRequest(
					`AI provider error: ${error?.message || "Unknown error"}`,
				).toTRPCError();
			}

			throw AppError.badRequest("Unknown error").toTRPCError();
		}
	}

	validateApiKey(provider: LLMProvider, apiKey?: string): boolean {
		switch (provider) {
			case "openai":
				return !!(apiKey || config.OPENAI_API_KEY);
			case "anthropic":
				return !!(apiKey || config.ANTHROPIC_API_KEY);
			case "google":
				return !!(apiKey || config.GOOGLE_API_KEY);
			default:
				return false;
		}
	}

	hasGlobalApiKey(provider: LLMProvider): boolean {
		switch (provider) {
			case "openai":
				return !!config.OPENAI_API_KEY;
			case "anthropic":
				return !!config.ANTHROPIC_API_KEY;
			case "google":
				return !!config.GOOGLE_API_KEY;
			default:
				return false;
		}
	}
}

export const llmService = new LLMService();
