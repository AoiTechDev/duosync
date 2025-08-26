import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const profileData = await request.json()
    
    // Update user profile in database
    await db.update(users)
      .set({
        username: profileData.username?.toLowerCase(),
        region: profileData.region,
        summonerName: profileData.summonerName,
        currentRank: profileData.currentRank,
        mainRole: profileData.mainRole,
        secondaryRole: profileData.secondaryRole,
        playstyle: profileData.playstyle || [],
        communication: profileData.communication || [],
        goals: profileData.goals || [],
        availability: profileData.availability || {},
        bio: profileData.bio || '',
        updatedAt: new Date()
      })
      .where(eq(users.email, session.user.email))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete profile' },
      { status: 500 }
    )
  }
}