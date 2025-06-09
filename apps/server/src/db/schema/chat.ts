import {
	boolean,
	date,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const conversations = pgTable("conversations", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	conversationId: uuid("conversation_id")
		.references(() => conversations.id, { onDelete: "cascade" })
		.notNull(),
	role: varchar("role", { length: 10 }).notNull(), // 'user' ou 'assistant'
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usage = pgTable("usage", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	period: date("period").notNull(),
	messageCount: integer("message_count").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
