import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	vector,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const project = pgTable("project", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	settings: text("settings"),
	isArchived: boolean("is_archived").notNull().default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversation = pgTable("conversation", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id")
		.references(() => project.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const message = pgTable(
	"message",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		conversationId: uuid("conversation_id")
			.references(() => conversation.id, { onDelete: "cascade" })
			.notNull(),
		role: varchar("role", { length: 10 }).notNull(),
		content: text("content").notNull(),
		metadata: text("metadata"),
		tokens: text("tokens"),
		embedding: vector("embedding", { dimensions: 1536 }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("embedding_index").using(
			"hnsw",
			table.embedding.op("vector_cosine_ops"),
		),
	],
);

export type ProjectTypeSelect = typeof project.$inferSelect;
export type ProjectTypeInsert = typeof project.$inferInsert;

export type ConversationTypeSelect = typeof conversation.$inferSelect;
export type ConversationTypeInsert = typeof conversation.$inferInsert;

export type MessageTypeSelect = typeof message.$inferSelect;
export type MessageTypeInsert = typeof message.$inferInsert;
