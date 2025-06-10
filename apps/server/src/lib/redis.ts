import { Redis } from "ioredis";
import "dotenv/config";

if (!process.env.REDIS_URL) {
	throw new Error("REDIS_URL is not set");
}

const redis = new Redis(process.env.REDIS_URL, {
	maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
	console.error("[Redis] connection error:", err);
});

redis.on("reconnecting", () => {
	console.warn("[Redis] reconnecting…");
});

export default redis;
