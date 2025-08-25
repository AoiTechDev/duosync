;(async () => {
  const { default: dotenv } = await import('dotenv')
  dotenv.config({ path: '.env.local' })

  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.log('DATABASE_URL format:', (process.env.DATABASE_URL?.substring(0, 15) ?? '') + '...')

  const { default: postgres } = await import('postgres')
  const sql = postgres(process.env.DATABASE_URL, { max: 1 })

  try {
    const result = await sql`SELECT 1 as test`
    console.log('✅ Database connection successful!')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await sql.end()
  }
})()