import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingData {
  // Step 1: Basic Info
  username?: string
  region?: string
  
  // Step 2: Riot Account
  summonerName?: string
  gameName?: string
  tagLine?: string
  riotVerified?: boolean
  currentRank?: string
  
  // Step 3: Preferences
  mainRole?: string
  secondaryRole?: string
  playstyle?: string[]
  communication?: string[]
  
  // Step 4: Availability
  goals?: string[]
  availability?: Record<string, string[]>
  bio?: string
}

interface OnboardingStore {
  currentStep: number
  data: OnboardingData
  isCompleted: boolean
  
  // Actions
  setStep: (step: number) => void
  updateData: (newData: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  completeOnboarding: () => Promise<void>
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      data: {},
      isCompleted: false,
      
      setStep: (step) => set({ currentStep: step }),
      
      updateData: (newData) => set((state) => ({
        data: { ...state.data, ...newData }
      })),
      
      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 4)
      })),
      
      prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1)
      })),
      
      completeOnboarding: async () => {
        const { data } = get()
        try {
          // Save to database
          const response = await fetch('/api/profile/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          if (response.ok) {
            set({ isCompleted: true })
            // Redirect to dashboard
            window.location.href = '/dashboard'
          }
        } catch (error) {
          console.error('Failed to complete onboarding:', error)
        }
      },
      
      reset: () => set({ currentStep: 1, data: {}, isCompleted: false })
    }),
    {
      name: 'duosync-onboarding'
    }
  )
)