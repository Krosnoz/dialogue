import { type ConnectionOptions, Queue } from "bullmq";
import redis from "../redis";

export const chatQueue = new Queue("chat-queue", {
	connection: redis,
});
