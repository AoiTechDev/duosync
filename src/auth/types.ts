import { users } from '@/db/schema'

/**
 * User type inferred from Drizzle schema
 */
export type AuthUser = typeof users.$inferSelect

/**
 * User insert type for creating new users
 */
export type AuthUserInsert = typeof users.$inferInsert

/**
 * User display helpers type
 */
export interface UserDisplayHelpers {
  getInitials: (name: string | null, username: string) => string
  getDisplayName: (user: AuthUser) => string
  getFormattedRank: (rank: string | null) => string | null
} 