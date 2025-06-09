import { reset } from "drizzle-seed";
import { db } from "..";
import * as schema from "../schema";

async function main() {
	try {
		console.log("🗑️  Resetting database...");
		await reset(db, schema);
		console.log("✅ Database reset complete");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

main();
