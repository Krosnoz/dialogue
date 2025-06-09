import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

export * from "./schema";
export {
	and,
	desc,
	eq,
	cosineDistance,
	sql,
	isNull,
	or,
	inArray,
} from "drizzle-orm";
