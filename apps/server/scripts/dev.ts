#!/usr/bin/env node

import { exec, spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../.env") });

const port = process.env.PORT || 3000;

console.log(`🔄 Killing process on port ${port}...`);

exec(`kill-port ${port}`, (error) => {
	if (error && !error.message.includes("No process found")) {
		console.warn(`⚠️  Could not kill port ${port}:`, error.message);
	}

	console.log("🚀 Starting development server...");

	const nodemon = spawn(
		"nodemon",
		[
			"--watch",
			"src",
			"--watch",
			"../../packages",
			"-e",
			"ts,tsx",
			"--exec",
			"bun src/index.ts",
		],
		{
			stdio: "inherit",
			shell: true,
		},
	);

	nodemon.on("close", (code) => {
		process.exit(code || 0);
	});
});
