import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account";
import { project } from "./project";
import { session } from "./session";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
	projects: many(project),
	accounts: many(account),
	sessions: many(session),
}));

export type UserTypeSelect = typeof user.$inferSelect;
