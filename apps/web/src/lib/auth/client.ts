import { createAuthClient } from "@dialogue/auth/client";

export const authClient = createAuthClient(
	process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8787",
);
