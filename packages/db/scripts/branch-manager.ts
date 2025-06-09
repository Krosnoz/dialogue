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
	project_id: string;
	parent_id: string;
	parent_lsn?: string;
	name: string;
	protected: boolean;
	current_state: string;
	state_changed_at: string;
	creation_source: string;
	created_at: string;
	updated_at: string;
	default: boolean;
	init_source: string;
}

interface NeonOperation {
	id: string;
	project_id: string;
	branch_id: string;
	endpoint_id: string;
	action: string;
	status: string;
	failures_count: number;
	created_at: string;
	updated_at: string;
	total_duration_ms: number;
}

interface NeonRole {
	branch_id: string;
	name: string;
	protected: boolean;
	created_at: string;
	updated_at: string;
}

interface NeonConnectionUri {
	connection_uri: string;
	connection_parameters: {
		database: string;
		password: string;
		role: string;
		host: string;
		pooler_host: string;
	};
}

interface CreateBranchResponse {
	branch: NeonBranch;
	endpoints: NeonEndpoint[];
	operations: NeonOperation[][];
	roles: NeonRole[];
	databases: NeonDatabase[];
	connection_uris: NeonConnectionUri[];
}

interface NeonEndpoint {
	host: string;
	id: string;
	project_id: string;
	branch_id: string;
	autoscaling_limit_min_cu: number;
	autoscaling_limit_max_cu: number;
	region_id: string;
	type: string;
	current_state: string;
	settings: Record<string, unknown>;
	pooler_enabled: boolean;
	pooler_mode: string;
	disabled: boolean;
	passwordless_access: boolean;
	last_active: string;
	creation_source: string;
	created_at: string;
	updated_at: string;
	suspended_at?: string;
	proxy_host: string;
	suspend_timeout_seconds: number;
	provisioner: string;
}

interface NeonEndpointsResponse {
	endpoints: NeonEndpoint[];
}

interface NeonDatabase {
	id: number;
	branch_id: string;
	name: string;
	owner_name: string;
	created_at: string;
	updated_at: string;
}

interface NeonDatabasesResponse {
	databases: NeonDatabase[];
}

interface NeonPasswordRevealResponse {
	password: string;
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

	const devBranch = branches.find((b) => b.name === "dev");
	if (devBranch) return devBranch.id;

	const mainBranch = branches.find((b) => b.name === "main");
	if (mainBranch) return mainBranch.id;

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

async function getBranchDataByName(
	branchName: string,
): Promise<CreateBranchResponse> {
	const branches = await listBranches();
	const neonBranchName = `local/${branchName}`;
	const branch = branches.find((b) => b.name === neonBranchName);
	if (!branch) {
		throw new Error(`Branch '${neonBranchName}' not found on Neon`);
	}

	const data = (await makeNeonRequest(
		`/projects/${NEON_PROJECT_ID}/branches/${branch.id}`,
	)) as CreateBranchResponse;
	return data;
}

async function getBranchByName(branchName: string): Promise<NeonBranch> {
	const branches = await listBranches();
	const neonBranchName = `local/${branchName}`;
	const branch = branches.find((b) => b.name === neonBranchName);
	if (!branch) {
		throw new Error(`Branch '${neonBranchName}' not found on Neon`);
	}
	return branch;
}

async function getBranchEndpoints(branchId: string): Promise<NeonEndpoint[]> {
	const data = (await makeNeonRequest(
		`/projects/${NEON_PROJECT_ID}/branches/${branchId}/endpoints`,
	)) as NeonEndpointsResponse;
	return data.endpoints;
}

async function getBranchDatabases(branchId: string): Promise<NeonDatabase[]> {
	const data = (await makeNeonRequest(
		`/projects/${NEON_PROJECT_ID}/branches/${branchId}/databases`,
	)) as NeonDatabasesResponse;
	return data.databases;
}

async function getRolePassword(
	branchId: string,
	roleName: string,
): Promise<string> {
	const data = (await makeNeonRequest(
		`/projects/${NEON_PROJECT_ID}/branches/${branchId}/roles/${roleName}/reveal_password`,
	)) as NeonPasswordRevealResponse;
	return data.password;
}

function buildDatabaseUrl({
	user,
	password,
	host,
	db,
}: { user: string; password: string; host: string; db: string }): string {
	return `postgresql://${user}:${password}@${host}/${db}?sslmode=require`;
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

			case "select": {
				const branchName = await getBranchNameFromArg();
				const branch = await getBranchByName(branchName);

				if (branch.current_state !== "ready") {
					console.log("⏳ Waiting for branch to be ready...");
					await waitForBranchReady(branch.id);
				}

				const endpoints = await getBranchEndpoints(branch.id);
				const endpoint =
					endpoints.find((e) => e.type === "read_write") || endpoints[0];
				if (!endpoint) throw new Error("No endpoint found for branch");

				const databases = await getBranchDatabases(branch.id);
				const db = databases[0];
				if (!db) throw new Error("No database found for branch");

				const user = db.owner_name;
				const dbName = db.name;
				const password = await getRolePassword(branch.id, user);

				const dbUrl = buildDatabaseUrl({
					user,
					password,
					host: endpoint.host,
					db: dbName,
				});
				console.log(`\n🔗 Database URL: ${dbUrl}`);

				await waitForDatabaseConnectable(dbUrl);
				await updateEnvFiles(dbUrl);

				console.log(
					"\n✅ Branch selection complete! The DATABASE_URL has been updated in all .env files.",
				);
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
  bun db:branch select [branch-name]  - Set current Neon branch and update env

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
