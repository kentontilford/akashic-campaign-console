'use client'

import { CheckIcon } from '@/lib/icons'

interface Step {
  id: string
  title: string
  description: string
}

interface OnboardingProgressProps {
  steps: Step[]
  currentStep: number
}

export default function OnboardingProgress({ steps, currentStep }: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 relative">
            {/* Progress Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-10 right-0 h-0.5 ${
                  index < currentStep ? 'bg-akashic-primary' : 'bg-gray-300'
                }`}
              />
            )}

            {/* Step Circle */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep
                    ? 'bg-akashic-primary border-akashic-primary text-white'
                    : index === currentStep
                    ? 'bg-white border-akashic-primary text-akashic-primary'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Step Title */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}