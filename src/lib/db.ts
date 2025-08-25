import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'
import { config } from 'dotenv'

config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 1,
})

export const db = drizzle(client, { schema })

export type User = typeof schema.users.$inferSelect
export type NewUser = typeof schema.users.$inferInsert
export type Post = typeof schema.posts.$inferSelect
export type NewPost = typeof schema.posts.$inferInsert
export type Message = typeof schema.messages.$inferSelect
export type Friendship = typeof schema.friendships.$inferSelect