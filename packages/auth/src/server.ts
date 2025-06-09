import "dotenv/config";

import { redis } from "@dialogue/api";
import { db } from "@dialogue/db";
import * as schema from "@dialogue/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

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
			return ((await redis.get(key)) as string) ?? null;
		},
		set: async (key: string, value: string, ttl?: number) => {
			await redis.set(key, value, "EX", ttl ?? 60 * 60 * 24 * 30);
		},
		delete: async (key: string) => {
			await redis.del(key);
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
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			partitioned: true,
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
			prompt: "select_account",
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
