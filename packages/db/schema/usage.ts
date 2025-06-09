import {
	date,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const usage = pgTable("usage", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	period: date("period").notNull(),
	messageCount: integer("message_count").default(0).notNull(),
	projectCount: integer("project_count").default(0).notNull(),
	totalTokens: integer("total_tokens").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usageEvent = pgTable("usage_event", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	type: text("type").notNull(),
	metadata: text("metadata"),
	tokens: integer("tokens").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UsageTypeSelect = typeof usage.$inferSelect;
export type UsageTypeInsert = typeof usage.$inferInsert;

export type UsageEventTypeSelect = typeof usageEvent.$inferSelect;
export type UsageEventTypeInsert = typeof usageEvent.$inferInsert;
