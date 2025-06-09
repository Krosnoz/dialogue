import { createOpenAI } from "@ai-sdk/openai";
import { AppError } from "@dialogue/api/errors";
import { embed } from "ai";
import { config } from "../../config";

export const generateEmbedding = async (
	value: string,
	apiKey?: string,
): Promise<number[]> => {
	const input = value.replaceAll("\n", " ");

	const effectiveApiKey = apiKey || config.OPENAI_API_KEY;

	if (!effectiveApiKey) {
		throw AppError.badRequest(
			"OpenAI API key is required. Provide it as a parameter or set OPENAI_API_KEY environment variable.",
		).toTRPCError();
	}

	const openai = createOpenAI({
		apiKey: effectiveApiKey,
	});

	const { embedding } = await embed({
		model: openai.embedding("text-embedding-3-small", {
			dimensions: 512,
		}),
		value: input,
	});

	return embedding;
};
