import { appRouter } from "@dialogue/api";
import { auth } from "@dialogue/auth";
import { trpcServer } from "@hono/trpc-server";
import * as Sentry from "@sentry/node";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { config } from "./config";
import { createContext } from "./lib/context";

if (config.SENTRY_DSN) {
	Sentry.init({
		dsn: config.SENTRY_DSN,
		tracesSampleRate: 1.0,
	});
}

const app = new Hono();

app.onError((err, c) => {
	if (config.SENTRY_DSN) {
		Sentry.captureException(err);
	}
	if (err instanceof HTTPException) {
		return err.getResponse();
	}
	return c.json({ error: "Internal server error" }, 500);
});

app.use(logger());
app.use(
	"/*",
	cors({
		origin: config.CORS_ORIGIN || "",
		allowHeaders: ["Content-Type", "Authorization", "trpc-accept"],
		allowMethods: ["GET", "POST", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: async (_opts, context) => {
			return createContext({ context });
		},
	}),
);

export default {
	port: config.PORT,
	fetch: app.fetch,
};
