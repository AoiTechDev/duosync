import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Get the current authenticated user from the database
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  })

  return user
}

/**
 * Check if user is authenticated
 * @returns boolean
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions)
  return !!session?.user?.email
}

/**
 * Get current session
 * @returns NextAuth session or null
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
} 