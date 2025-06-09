import Dexie, { type EntityTable } from "dexie";

export interface LocalConversation {
	id: string;
	userId: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	syncStatus: "synced" | "pending" | "failed";
}

export interface LocalMessage {
	id: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: Date;
	syncStatus: "synced" | "pending" | "failed";
}

export interface LocalUser {
	id: string;
	name: string;
	email: string;
	image?: string;
	syncStatus: "synced" | "pending" | "failed";
}

export class LocalChatDB extends Dexie {
	conversations!: EntityTable<LocalConversation, "id">;
	messages!: EntityTable<LocalMessage, "id">;
	users!: EntityTable<LocalUser, "id">;

	constructor() {
		super("LocalChatDB");

		this.version(1).stores({
			conversations: "id, userId, title, createdAt, updatedAt, syncStatus",
			messages: "id, conversationId, role, createdAt, syncStatus",
			users: "id, email, syncStatus",
		});
	}
}

export const localDb = new LocalChatDB();
