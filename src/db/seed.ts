import { db } from '@/lib/db'
import { users, posts } from './schema'
import { config } from 'dotenv'

config()

async function seed() {
  console.log('🌱 Seeding database...')

  const sampleUsers = await db.insert(users).values([
    {
      email: 'john@example.com',
      username: 'johndoe',
      summonerName: 'JohnTheRiftWalker',
      region: 'NA1',
      soloRank: 'GOLD_II',
      flexRank: 'GOLD_I',
      mainRole: 'ADC',
      secondaryRole: 'MID',
      bio: 'Looking for consistent duo partner to climb ranked!',
      playstyle: ['aggressive', 'team-player'],
      communication: ['voice', 'discord'],
      goals: ['climb', 'improve']
    },
    {
      email: 'jane@example.com',
      username: 'janesmith',
      summonerName: 'JaneSupreme',
      region: 'NA1',
      soloRank: 'SILVER_I',
      flexRank: 'SILVER_III',
      mainRole: 'SUPPORT',
      secondaryRole: 'JUNGLE',
      bio: 'Friendly support main, let\'s have fun and win!',
      playstyle: ['supportive', 'strategic'],
      communication: ['text', 'discord'],
      goals: ['fun', 'learn']
    }
  ]).returning()

  // Create sample posts
  await db.insert(posts).values([
    {
      description: 'Looking for a consistent support player to duo with in ranked. I main ADC and am currently Gold 2. Prefer someone who uses voice chat and wants to climb!',
      authorId: sampleUsers[0].id,
      role: 'ADC',
      rank: 'GOLD',
      region: 'NA1'
    },
    {
      description: 'Support main online now and ready to play some games. Looking for chill ADC player for a few ranked games.',
      authorId: sampleUsers[1].id,
      role: 'SUPPORT',
      rank: 'SILVER',
      region: 'NA1'
    }
  ])

  console.log('✅ Database seeded successfully!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})