'use client'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-medium text-muted-foreground">Loading...</div>
      </div>
    )
  }
  
  if (!session) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <OnboardingProgress />
          <div className="bg-card border border-border rounded-xl shadow-2xl p-8 mt-8 backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}