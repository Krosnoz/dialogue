import OpenAI from "openai";
import "dotenv/config";

if (!process.env.OPENAI_API_KEY) {
	throw new Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export class ChatService {
	async *streamCompletion(
		messages: ChatMessage[],
		model = "gpt-4o",
	): AsyncIterableIterator<string> {
		try {
			const stream = await openai.chat.completions.create({
				model,
				messages,
				stream: true,
				temperature: 0.7,
				max_tokens: 4000,
			});

			for await (const chunk of stream) {
				const content = chunk.choices[0]?.delta?.content;
				if (content) {
					yield content;
				}
			}
		} catch (error) {
			console.error("OpenAI API error:", error);
			throw error;
		}
	}

	async getCompletion(
		messages: ChatMessage[],
		model = "gpt-4o",
	): Promise<string> {
		try {
			const response = await openai.chat.completions.create({
				model,
				messages,
				temperature: 0.7,
				max_tokens: 4000,
			});

			return response.choices[0]?.message?.content || "";
		} catch (error) {
			console.error("OpenAI API error:", error);
			throw error;
		}
	}
}

export const chatService = new ChatService();
