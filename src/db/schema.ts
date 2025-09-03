import {
  pgTable,
  text,
  timestamp,
  boolean,
  json,
  pgEnum,
  uuid,
  integer,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";
import { regions } from "@/data/constants";

export const roleEnum = pgEnum("role", [
  "TOP",
  "JUNGLE",
  "MID",
  "ADC",
  "SUPPORT",
  "FILL",
]);

export const rankEnum = pgEnum("rank", [
  "IRON_I",
  "IRON_II",
  "IRON_III",
  "IRON_IV",
  "BRONZE_I",
  "BRONZE_II",
  "BRONZE_III",
  "BRONZE_IV",
  "SILVER_I",
  "SILVER_II",
  "SILVER_III",
  "SILVER_IV",
  "GOLD_I",
  "GOLD_II",
  "GOLD_III",
  "GOLD_IV",
  "PLATINUM_I",
  "PLATINUM_II",
  "PLATINUM_III",
  "PLATINUM_IV",
  "EMERALD_I",
  "EMERALD_II",
  "EMERALD_III",
  "EMERALD_IV",
  "DIAMOND_I",
  "DIAMOND_II",
  "DIAMOND_III",
  "DIAMOND_IV",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
]);

export const rankMinEnum = pgEnum("rank_min", [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
]);

export const regionEnum = pgEnum("region", regions as [string, ...string[]]);
export type Region = (typeof regionEnum.enumValues)[number];

export const gameModeEnum = pgEnum("game_mode", [
  "RANKED_SOLO",
  "RANKED_FLEX",
  "NORMAL",
  "ARAM",
]);

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "PENDING",
  "ACCEPTED",
  "BLOCKED",
]);

// NextAuth adapter tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),

  // Custom fields
  username: text("username").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  summonerName: text("summoner_name"),
  region: regionEnum("region"),
  soloRank: rankEnum("solo_rank"),
  flexRank: rankEnum("flex_rank"),
  mainRole: roleEnum("main_role"),
  secondaryRole: roleEnum("secondary_role"),
  bio: text("bio"),
  avatar: text("avatar"),

  playstyle: json("playstyle").$type<string[]>(),
  communication: json("communication").$type<string[]>(),
  goals: json("goals").$type<string[]>(),
  availability: json("availability"),
});

export type User = typeof users.$inferSelect;

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  rank: rankMinEnum("rank_min").notNull(),
  region: regionEnum("region").notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
});

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: friendshipStatusEnum("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),

    senderId: uuid("sender_id")
      .references(() => users.id)
      .notNull(),
    receiverId: uuid("receiver_id")
      .references(() => users.id)
      .notNull(),
  },
  (table) => ({
    uniqueFriendship: unique().on(table.senderId, table.receiverId),
  })
);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),

  senderId: uuid("sender_id")
    .references(() => users.id)
    .notNull(),
  receiverId: uuid("receiver_id")
    .references(() => users.id)
    .notNull(),
});

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    postId: uuid("post_id")
      .references(() => posts.id)
      .notNull(),
  },
  (table) => ({
    uniqueLike: unique().on(table.userId, table.postId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts),
  sentMessages: many(messages, { relationName: "messageSender" }),
  receivedMessages: many(messages, { relationName: "messageReceiver" }),
  sentFriendships: many(friendships, { relationName: "friendshipSender" }),
  receivedFriendships: many(friendships, {
    relationName: "friendshipReceiver",
  }),
  likes: many(likes),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  likes: many(likes),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  sender: one(users, {
    fields: [friendships.senderId],
    references: [users.id],
    relationName: "friendshipSender",
  }),
  receiver: one(users, {
    fields: [friendships.receiverId],
    references: [users.id],
    relationName: "friendshipReceiver",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "messageSender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "messageReceiver",
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));
