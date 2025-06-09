import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3001),

	// Database
	DATABASE_URL: z.string().min(1),

	// Auth
	BETTER_AUTH_SECRET: z.string().min(1),
	BETTER_AUTH_URL: z.string().url(),

	// CORS
	CORS_ORIGIN: z.string().optional(),

	// AI Providers
	OPENAI_API_KEY: z.string().optional(),
	ANTHROPIC_API_KEY: z.string().optional(),
	GOOGLE_API_KEY: z.string().optional(),

	// Redis
	REDIS_URL: z.string().url(),

	// Monitoring
	SENTRY_DSN: z.string().optional(),
});

function validateConfig() {
	try {
		return configSchema.parse(process.env);
	} catch (error) {
		console.error("❌ Invalid environment configuration:", error);
		process.exit(1);
	}
}

export const config = validateConfig();

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
