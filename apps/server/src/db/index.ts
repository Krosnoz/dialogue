import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth";
import * as chatSchema from "./schema/chat";

export const db = drizzle(process.env.DATABASE_URL || "", {
	schema: { ...authSchema, ...chatSchema },
});

export { authSchema, chatSchema };
