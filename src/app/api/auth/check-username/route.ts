import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()
    
    if (!username || username.length < 3) {
      return NextResponse.json(
        { available: false, message: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }
    
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username.toLowerCase())
    })
    
    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    })
  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json(
      { available: false, message: 'Failed to check username' },
      { status: 500 }
    )
  }
}