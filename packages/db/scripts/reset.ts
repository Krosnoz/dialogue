import { reset } from "drizzle-seed";
import { db } from "..";
import * as schema from "../schema";

async function resetDatabase() {
	console.log("🗑️  Resetting database...");
	await reset(db, schema);
	console.log("✅ Database reset complete");
}

async function seedDatabase() {
	console.log("🌱 Seeding database...");
	// Add your seed logic here
	// Example:
	// await db.insert(schema.users).values([
	//   { name: "John Doe", email: "john@example.com" },
	//   { name: "Jane Smith", email: "jane@example.com" },
	// ]);
	console.log("✅ Database seeded");
}

async function main() {
	const shouldSeed = process.argv.includes("--seed");

	try {
		await resetDatabase();

		if (shouldSeed) {
			await seedDatabase();
		}

		console.log("🎉 Database operation completed successfully");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

main();
