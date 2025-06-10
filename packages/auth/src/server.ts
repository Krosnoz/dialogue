import { db } from "@dialogue/db";
import * as schema from "@dialogue/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Redis } from "ioredis";
import "dotenv/config";

if (!process.env.REDIS_URL) {
	throw new Error("REDIS_URL is not set");
}

const cache = new Redis(process.env.REDIS_URL);

cache.on("error", (err) => {
	console.error("[Redis] connection error:", err);
});

cache.on("reconnecting", () => {
	console.warn("[Redis] reconnecting…");
});

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	secondaryStorage: {
		get: async (key: string) => {
			return ((await cache.get(key)) as string) ?? null;
		},
		set: async (key: string, value: string, ttl?: number) => {
			await cache.set(key, value, "EX", ttl ?? 60 * 60 * 24 * 30);
		},
		delete: async (key: string) => {
			await cache.del(key);
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	advanced: {
		ipAddress: {
			disableIpTracking: true,
		},
		cookiePrefix:
			process.env.NODE_ENV === "development"
				? "better-auth-dev"
				: "better-auth",
		crossSubDomainCookies: {
			enabled: true,
			domain: process.env.COOKIE_DOMAIN,
		},
	},
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3001"],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 30,
		},
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24 * 3,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
			trustedProviders: ["google", "github"],
		},
	},
});
