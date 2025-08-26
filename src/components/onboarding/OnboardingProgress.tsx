'use client'
import { useOnboardingStore } from '@/store/onboarding-store'

const steps = [
  { number: 1, title: 'Basic Info' },
  { number: 2, title: 'Riot Account' },
  { number: 3, title: 'Preferences' },
  { number: 4, title: 'Availability' }
]

export function OnboardingProgress() {
  const currentStep = useOnboardingStore(state => state.currentStep)
  
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Welcome to DuoSync
        </h1>
        <p className="text-muted-foreground">
          Let&apos;s set up your profile
        </p>
      </div>
      
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-10" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-6 left-6 h-0.5 bg-primary transition-all duration-700 ease-out -z-10"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 48px)'
          }}
        />
        
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center relative">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 bg-background border-2
              ${currentStep >= step.number 
                ? 'border-primary text-primary' 
                : 'border-border text-muted-foreground'
              }
            `}>
              {step.number}
            </div>
            
            <div className="mt-4 text-center">
              <div className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}