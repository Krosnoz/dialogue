import "dotenv/config";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const NEON_API_KEY = process.env.NEON_API_KEY;
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID;
const NEON_API_BASE = "https://console.neon.tech/api/v2";

if (!NEON_API_KEY || !NEON_PROJECT_ID) {
	console.error(
		"❌ Missing NEON_API_KEY or NEON_PROJECT_ID environment variables",
	);
	process.exit(1);
}

interface NeonBranch {
	id: string;
	name: string;
	parent_id?: string;
	current_state: string;
	created_at: string;
}

interface CreateBranchResponse {
	branch: NeonBranch;
	endpoints: Array<{
		id: string;
		host: string;
		type: string;
	}>;
	connection_uris: Array<{
		connection_uri: string;
		connection_parameters: {
			database: string;
			password: string;
			role: string;
			host: string;
			pooler_host: string;
		};
	}>;
}

async function getCurrentGitBranch(): Promise<string> {
	try {
		return execSync("git branch --show-current", { encoding: "utf-8" }).trim();
	} catch (error) {
		console.error("❌ Failed to get current Git branch");
		process.exit(1);
	}
}

async function getBranchNameFromArg(): Promise<string> {
	const branchArg = process.argv[3];
	if (branchArg) {
		return branchArg;
	}
	return getCurrentGitBranch();
}

async function makeNeonRequest(endpoint: string, options: RequestInit = {}) {
	const response = await fetch(`${NEON_API_BASE}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${NEON_API_KEY}`,
			Accept: "application/json",
			"Content-Type": "application/json",
			...options.headers,
		},
		...options,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Neon API error: ${response.status} - ${error}`);
	}

	return response.json();
}

async function listBranches(): Promise<NeonBranch[]> {
	const data = (await makeNeonRequest(
		`/projects/${NEON_PROJECT_ID}/branches`,
	)) as { branches: NeonBranch[] };
	return data.branches;
}

async function findParentBranch(): Promise<string> {
	const branches = await listBranches();

	// Try to find 'dev' branch first, fallback to 'main'
	const devBranch = branches.find((b) => b.name === "dev");
	if (devBranch) return devBranch.id;

	const mainBranch = branches.find((b) => b.name === "main");
	if (mainBranch) return mainBranch.id;

	// Fallback to first available branch
	if (branches.length > 0) return branches[0].id;

	throw new Error("No parent branch found");
}

async function createBranch(branchName: string): Promise<CreateBranchResponse> {
	const parentId = await findParentBranch();
	const neonBranchName = `local/${branchName}`;

	console.log(`🚀 Creating Neon branch: ${neonBranchName}`);

	const data = (await makeNeonRequest(`/projects/${NEON_PROJECT_ID}/branches`, {
		method: "POST",
		body: JSON.stringify({
			branch: {
				parent_id: parentId,
				name: neonBranchName,
			},
			endpoints: [
				{
					type: "read_write",
				},
			],
		}),
	})) as CreateBranchResponse;

	console.log(`✅ Created Neon branch: ${neonBranchName}`);
	console.log(`📊 Branch ID: ${data.branch.id}`);

	return data;
}

async function deleteBranch(branchName: string): Promise<void> {
	const branches = await listBranches();
	const neonBranchName = `local/${branchName}`;
	const branch = branches.find((b) => b.name === neonBranchName);

	if (!branch) {
		console.log(`⚠️  Branch '${neonBranchName}' not found`);
		return;
	}

	console.log(`🗑️  Deleting Neon branch: ${neonBranchName}`);

	await makeNeonRequest(`/projects/${NEON_PROJECT_ID}/branches/${branch.id}`, {
		method: "DELETE",
	});

	console.log(`✅ Deleted Neon branch: ${neonBranchName}`);
}

async function listLocalBranches(): Promise<void> {
	const branches = await listBranches();
	const localBranches = branches.filter((b) => b.name.startsWith("local/"));

	console.log("\n🌿 Local Neon branches:");
	if (localBranches.length === 0) {
		console.log("   No local branches found");
		return;
	}

	// biome-ignore lint/complexity/noForEach: <explanation>
	localBranches.forEach((branch) => {
		const status = branch.current_state === "ready" ? "✅" : "⏳";
		const gitBranchName = branch.name.replace("local/", "");
		console.log(`   ${status} ${gitBranchName} (${branch.id})`);
	});
}

async function generateDatabaseUrl(
	branchData: CreateBranchResponse,
): Promise<string> {
	const endpoint = branchData.endpoints[0];
	const connection_uri = branchData.connection_uris[0];

	if (!endpoint) {
		throw new Error("No endpoint found for the branch");
	}

	if (!connection_uri) {
		return `postgresql://[user]:[password]@${endpoint.host}/neondb`;
	}

	return `postgresql://${connection_uri.connection_parameters.role}:${connection_uri.connection_parameters.password}@${connection_uri.connection_parameters.pooler_host}/${connection_uri.connection_parameters.database}?sslmode=require`;
}

async function waitForBranchReady(
	branchId: string,
	maxWaitTime = 30000,
): Promise<void> {
	const startTime = Date.now();

	while (Date.now() - startTime < maxWaitTime) {
		const branches = await listBranches();
		const branch = branches.find((b) => b.id === branchId);

		if (branch?.current_state === "ready") {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	throw new Error("Branch did not become ready within timeout");
}

async function waitForDatabaseConnectable(
	databaseUrl: string,
	maxWaitTime = 60000,
): Promise<void> {
	const startTime = Date.now();

	console.log("⏳ Waiting for database endpoint to be connectable...");

	const url = new URL(databaseUrl);
	const host = url.hostname;

	while (Date.now() - startTime < maxWaitTime) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			await fetch(`https://${host}:443`, {
				signal: controller.signal,
				mode: "no-cors",
			});

			clearTimeout(timeoutId);

			console.log("✅ Database endpoint is ready");
			return;
		} catch (error) {
			console.log("Connection failed, continuing...");
		}

		await new Promise((resolve) => setTimeout(resolve, 3000));
	}

	console.log(
		"⚠️  Database endpoint might not be fully ready, but proceeding...",
	);
}

async function updateEnvFiles(databaseUrl: string): Promise<void> {
	const gitRoot = execSync("git rev-parse --show-toplevel", {
		encoding: "utf-8",
	}).trim();
	const envPaths = [
		path.join(gitRoot, "apps/server/.env"),
		path.join(gitRoot, "packages/auth/.env"),
		path.join(gitRoot, "packages/db/.env"),
	];

	console.log("🔧 Updating .env files...");

	for (const envPath of envPaths) {
		try {
			let envContent = "";

			if (existsSync(envPath)) {
				envContent = readFileSync(envPath, "utf-8");
			}

			const lines = envContent.split("\n");
			let updated = false;

			for (let i = 0; i < lines.length; i++) {
				if (lines[i].startsWith("DATABASE_URL=")) {
					lines[i] = `DATABASE_URL=${databaseUrl}`;
					updated = true;
					break;
				}
			}

			if (!updated) {
				if (envContent && !envContent.endsWith("\n")) {
					lines.push("");
				}
				lines.push(`DATABASE_URL=${databaseUrl}`);
			}

			writeFileSync(envPath, lines.join("\n"));
			console.log(`   ✅ Updated ${envPath}`);
		} catch (error) {
			console.error(`   ❌ Failed to update ${envPath}:`, error);
		}
	}
}

async function main() {
	const command = process.argv[2];

	try {
		switch (command) {
			case "create": {
				const branchName = await getBranchNameFromArg();
				const branchData = await createBranch(branchName);

				console.log("⏳ Waiting for branch to be ready...");
				await waitForBranchReady(branchData.branch.id);

				const dbUrl = await generateDatabaseUrl(branchData);
				console.log(`\n🔗 Database URL: ${dbUrl}`);

				await waitForDatabaseConnectable(dbUrl);
				await updateEnvFiles(dbUrl);

				console.log(
					"\n✅ Branch setup complete! The DATABASE_URL has been updated in all .env files.",
				);
				break;
			}

			case "delete": {
				const branchName = await getBranchNameFromArg();
				await deleteBranch(branchName);
				break;
			}

			case "list": {
				await listLocalBranches();
				break;
			}

			case "cleanup": {
				const branches = await listBranches();
				const localBranches = branches.filter((b) =>
					b.name.startsWith("local/"),
				);

				console.log(`🧹 Cleaning up ${localBranches.length} local branches...`);

				for (const branch of localBranches) {
					const gitBranchName = branch.name.replace("local/", "");
					await deleteBranch(gitBranchName);
				}
				break;
			}

			default:
				console.log(`
🌿 Neon Branch Manager

Usage:
  bun db:branch create [branch-name]  - Create a local Neon branch (defaults to current git branch)
  bun db:branch delete [branch-name]  - Delete a local Neon branch
  bun db:branch list                  - List all local Neon branches
  bun db:branch cleanup               - Delete all local Neon branches

Examples:
  bun db:branch create                # Creates branch for current git branch
  bun db:branch create feature/auth   # Creates branch for specific name
  bun db:branch delete feature/auth   # Deletes specific branch
  bun db:branch list                  # Shows all local branches
				`);
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error(`❌ Error: ${error.message}`);
		} else {
			console.error(`❌ Error: ${error}`);
		}
		process.exit(1);
	}
}

main();
