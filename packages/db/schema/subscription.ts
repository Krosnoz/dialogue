import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const subscription = pgTable("subscription", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	stripeSubscriptionId: text("stripe_subscription_id").unique(),
	stripeCustomerId: text("stripe_customer_id").notNull(),
	stripePriceId: text("stripe_price_id").notNull(),
	status: text("status").notNull(),
	currentPeriodStart: timestamp("current_period_start").notNull(),
	test: text("test"),
	currentPeriodEnd: timestamp("current_period_end").notNull(),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const plan = pgTable("plan", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	stripePriceId: text("stripe_price_id").notNull().unique(),
	price: integer("price").notNull(),
	interval: text("interval").notNull(),
	features: text("features"),
	maxMessages: integer("max_messages"),
	maxProjects: integer("max_projects"),
	active: boolean("active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SubscriptionTypeSelect = typeof subscription.$inferSelect;
export type SubscriptionTypeInsert = typeof subscription.$inferInsert;

export type PlanTypeSelect = typeof plan.$inferSelect;
export type PlanTypeInsert = typeof plan.$inferInsert;
