import OpenAI from "openai";
import "dotenv/config";

if (!process.env.OPENAI_API_KEY) {
	throw new Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export const generateEmbedding = async (value: string): Promise<number[]> => {
	const input = value.replaceAll("\n", " ");

	const { data } = await openai.embeddings.create({
		model: "text-embedding-ada-002",
		input,
	});

	return data[0].embedding;
};
