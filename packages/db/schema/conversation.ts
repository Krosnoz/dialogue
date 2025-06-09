import { relations } from "drizzle-orm";
import {
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { message } from "./message";
import { project } from "./project";
import { user } from "./user";

export const conversationStatusEnum = pgEnum("conversation_status", [
	"idle",
	"processing",
]);

export const conversation = pgTable("conversation", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	projectId: uuid("project_id").references(() => project.id),
	title: varchar("title", { length: 255 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationRelations = relations(
	conversation,
	({ one, many }) => ({
		user: one(user, {
			fields: [conversation.userId],
			references: [user.id],
		}),
		project: one(project, {
			fields: [conversation.projectId],
			references: [project.id],
		}),
		messages: many(message),
	}),
);

export type ConversationTypeSelect = typeof conversation.$inferSelect;
export type ConversationTypeInsert = typeof conversation.$inferInsert;
