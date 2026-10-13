import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { type GameMode, type Rank } from "@/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 1,
});

export const db = drizzle(client, { schema });

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Post = typeof schema.posts.$inferSelect;
export type NewPost = typeof schema.posts.$inferInsert;
export type Friendship = typeof schema.friendships.$inferSelect;

export type PostWithAuthor = {
  id: string;
  description: string | null;
  isActive: boolean;
  expiresAt: Date;
  bumpedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  rank: Rank;
  role: string;
  region: string;
  gameMode: GameMode;
  authorId: string;
  author: {
    id: string;
    username: string;
    image: string | null;
    avatar: string | null;
    summonerName: string | null;
    soloRank: Rank | null;
    flexRank: Rank | null;
    mainRole: string | null;
    secondaryRole: string | null;
    lastSeenAt: Date | null;
  };
};

export type PostRelation = "self" | "friend" | "sent" | "incoming" | "none";

export type FeedPost = PostWithAuthor & {
  relation: PostRelation;
  requestId?: string;
};
