import Dexie, { type EntityTable } from "dexie";

export interface LocalProject {
	id: string;
	userId: string;
	title: string;
	description?: string;
	settings?: string;
	isArchived: boolean;
	createdAt: Date;
	updatedAt: Date;
	syncStatus: "synced" | "pending" | "failed";
}

export interface LocalConversation {
	id: string;
	projectId: string;
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
	metadata?: string;
	tokens?: string;
	createdAt: Date;
	syncStatus: "synced" | "pending" | "failed";
}

export interface LocalUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
	syncStatus: "synced" | "pending" | "failed";
}

export class LocalChatDB extends Dexie {
	projects!: EntityTable<LocalProject, "id">;
	conversations!: EntityTable<LocalConversation, "id">;
	messages!: EntityTable<LocalMessage, "id">;
	users!: EntityTable<LocalUser, "id">;

	constructor() {
		super("LocalChatDB");

		this.version(1).stores({
			projects:
				"id, userId, title, isArchived, createdAt, updatedAt, syncStatus",
			conversations: "id, projectId, title, createdAt, updatedAt, syncStatus",
			messages: "id, conversationId, role, createdAt, syncStatus",
			users: "id, email, emailVerified, syncStatus",
		});
	}
}

export const localDb = new LocalChatDB();
