import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	vector,
} from "drizzle-orm/pg-core";
import { conversation } from "./conversation";

export const message = pgTable(
	"message",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		conversationId: uuid("conversation_id")
			.references(() => conversation.id, { onDelete: "cascade" })
			.notNull(),
		parentId: uuid("parent_id"),
		role: varchar("role", { length: 10 }).notNull(),
		content: text("content").notNull(),
		provider: varchar("provider", { length: 50 }).default("openai"),
		model: varchar("model", { length: 100 }).default("gpt-4o"),
		embedding: vector("embedding", { dimensions: 512 }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "parent_id_fk",
		}).onDelete("set null"),
		index("embedding_index").using(
			"hnsw",
			table.embedding.op("vector_cosine_ops"),
		),
	],
);

export const messageRelations = relations(message, ({ one, many }) => ({
	conversation: one(conversation, {
		fields: [message.conversationId],
		references: [conversation.id],
	}),
	parent: one(message, {
		fields: [message.parentId],
		references: [message.id],
		relationName: "parent",
	}),
	children: many(message, {
		relationName: "parent",
	}),
}));

export type MessageTypeSelect = typeof message.$inferSelect;
export type MessageTypeInsert = typeof message.$inferInsert;
