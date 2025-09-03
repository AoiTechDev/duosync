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
  soloRank?: string
  flexRank?: string
  
  // Step 3: Preferences
  mainRole?: string
  secondaryRole?: string
  playstyleTags?: string[]
  goals?: string[]
  communication?: string[]
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
        currentStep: Math.min(state.currentStep + 1, 3)
      })),
      
      prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1)
      })),
      
      completeOnboarding: async () => {
        const { data } = get()
        
        // Clean up data to remove old rank fields before sending
        const cleanedData = {
          username: data.username,
          region: data.region,
          summonerName: data.summonerName ,
          gameName: data.gameName,
          tagLine: data.tagLine,
          riotVerified: data.riotVerified,
          soloRank: data.soloRank,
          flexRank: data.flexRank,
          mainRole: data.mainRole,
          secondaryRole: data.secondaryRole,
          playstyleTags: data.playstyleTags,
          communication: data.communication,
          goals: data.goals
        }
        
        try {
          // Save to database
          const response = await fetch('/api/profile/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanedData)
          })
          
          if (response.ok) {
            set({ isCompleted: true })
            // Redirect to dashboard
            window.location.href = '/feed'
          }
        } catch (error) {
          console.error('Failed to complete onboarding:', error)
        }
      },
      
      reset: () => set({ currentStep: 1, data: {}, isCompleted: false })
    }),
    {
      name: 'duosync-onboarding',
      migrate: (persistedState: unknown, version: number) => {
        // Clean up old rank fields from persisted data
        if (persistedState && typeof persistedState === 'object' && 'data' in persistedState) {
          const state = persistedState as { data: Record<string, unknown> };
          const { currentRank, peakRank, ...cleanData } = state.data;
          return {
            ...state,
            data: cleanData
          };
        }
        return persistedState;
      }
    }
  )
)