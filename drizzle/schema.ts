import { pgTable, foreignKey, unique, uuid, timestamp, text, boolean, json, primaryKey, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const friendshipStatus = pgEnum("friendship_status", ['PENDING', 'ACCEPTED', 'BLOCKED'])
export const gameMode = pgEnum("game_mode", ['RANKED_SOLO', 'RANKED_FLEX', 'NORMAL', 'ARAM'])
export const rank = pgEnum("rank", ['IRON_I', 'IRON_II', 'IRON_III', 'IRON_IV', 'BRONZE_I', 'BRONZE_II', 'BRONZE_III', 'BRONZE_IV', 'SILVER_I', 'SILVER_II', 'SILVER_III', 'SILVER_IV', 'GOLD_I', 'GOLD_II', 'GOLD_III', 'GOLD_IV', 'PLATINUM_I', 'PLATINUM_II', 'PLATINUM_III', 'PLATINUM_IV', 'EMERALD_I', 'EMERALD_II', 'EMERALD_III', 'EMERALD_IV', 'DIAMOND_I', 'DIAMOND_II', 'DIAMOND_III', 'DIAMOND_IV', 'MASTER', 'GRANDMASTER', 'CHALLENGER'])
export const rankMin = pgEnum("rank_min", ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'])
export const region = pgEnum("region", ['NA1', 'EUW1', 'EUN1', 'KR', 'BR1', 'LA1', 'LA2'])
export const role = pgEnum("role", ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT', 'FILL'])


export const friendships = pgTable("friendships", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	status: friendshipStatus().default('PENDING').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	senderId: uuid("sender_id").notNull(),
	receiverId: uuid("receiver_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "friendships_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "friendships_receiver_id_users_id_fk"
		}),
	unique("friendships_sender_id_receiver_id_unique").on(table.senderId, table.receiverId),
]);

export const likes = pgTable("likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	postId: uuid("post_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "likes_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "likes_post_id_posts_id_fk"
		}),
	unique("likes_user_id_post_id_unique").on(table.userId, table.postId),
]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	senderId: uuid("sender_id").notNull(),
	receiverId: uuid("receiver_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "messages_receiver_id_users_id_fk"
		}),
]);

export const sessions = pgTable("sessions", {
	sessionToken: text().primaryKey().notNull(),
	userId: uuid().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	region: region().notNull(),
	authorId: uuid("author_id").notNull(),
	rankMin: rankMin("rank_min").notNull(),
	role: role().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "posts_author_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	username: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	summonerName: text("summoner_name"),
	region: region(),
	mainRole: role("main_role"),
	secondaryRole: role("secondary_role"),
	bio: text(),
	avatar: text(),
	playstyle: json(),
	communication: json(),
	goals: json(),
	availability: json(),
	name: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	soloRank: rank("solo_rank"),
	flexRank: rank("flex_rank"),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);

export const verificationTokens = pgTable("verificationTokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationTokens_identifier_token_pk"}),
]);

export const accounts = pgTable("accounts", {
	userId: uuid().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_userId_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "accounts_provider_providerAccountId_pk"}),
]);
