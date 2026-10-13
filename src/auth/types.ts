import { users } from "@/db/schema";

export type AuthUser = typeof users.$inferSelect;

export type AuthUserInsert = typeof users.$inferInsert;

export interface UserDisplayHelpers {
  getInitials: (name: string | null, username: string) => string;
  getDisplayName: (user: AuthUser) => string;
  getFormattedRank: (rank: string | null) => string | null;
}
