import { relations } from "drizzle-orm/relations";
import { users, friendships, likes, posts, messages, sessions, accounts } from "./schema";

export const friendshipsRelations = relations(friendships, ({one}) => ({
	user_senderId: one(users, {
		fields: [friendships.senderId],
		references: [users.id],
		relationName: "friendships_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [friendships.receiverId],
		references: [users.id],
		relationName: "friendships_receiverId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	friendships_senderId: many(friendships, {
		relationName: "friendships_senderId_users_id"
	}),
	friendships_receiverId: many(friendships, {
		relationName: "friendships_receiverId_users_id"
	}),
	likes: many(likes),
	messages_senderId: many(messages, {
		relationName: "messages_senderId_users_id"
	}),
	messages_receiverId: many(messages, {
		relationName: "messages_receiverId_users_id"
	}),
	sessions: many(sessions),
	posts: many(posts),
	accounts: many(accounts),
}));

export const likesRelations = relations(likes, ({one}) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [likes.postId],
		references: [posts.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	likes: many(likes),
	user: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	user_senderId: one(users, {
		fields: [messages.senderId],
		references: [users.id],
		relationName: "messages_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [messages.receiverId],
		references: [users.id],
		relationName: "messages_receiverId_users_id"
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));