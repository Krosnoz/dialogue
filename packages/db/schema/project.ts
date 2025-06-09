import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { conversation } from "./conversation";
import { user } from "./user";

export const project = pgTable("project", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	settings: text("settings"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectRelations = relations(project, ({ one, many }) => ({
	user: one(user, {
		fields: [project.userId],
		references: [user.id],
	}),
	conversations: many(conversation),
}));

export type ProjectTypeSelect = typeof project.$inferSelect;
export type ProjectTypeInsert = typeof project.$inferInsert;
