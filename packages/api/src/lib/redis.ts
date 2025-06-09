import Redis from "ioredis";
import { config } from "../config";

const redis = new Redis(config.REDIS_URL, {
	maxRetriesPerRequest: null,
	enableReadyCheck: false,
});

redis.on("error", (err) => {
	console.error("[Redis] connection error:", err);
});

redis.on("reconnecting", () => {
	console.warn("[Redis] reconnecting…");
});

export { redis };
