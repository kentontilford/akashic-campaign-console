'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  OnboardingProgress,
  PersonalInfoStep,
  PoliticalBackgroundStep,
  ProfessionalBackgroundStep,
  CampaignDetailsStep,
  PolicyPositionsStep,
  CommunityInvolvementStep,
  CommunicationStyleStep,
  OppositionResearchStep,
  ReviewStep
} from '@/components/onboarding'
import { CandidateProfile } from '@/types/campaign-profile'
import toast from 'react-hot-toast'

const ONBOARDING_STEPS = [
  { id: 'personal', title: 'Personal Information', description: 'Basic information about the candidate' },
  { id: 'political', title: 'Political Background', description: 'Political experience and philosophy' },
  { id: 'professional', title: 'Professional Background', description: 'Education and work experience' },
  { id: 'campaign', title: 'Campaign Details', description: 'Current campaign information' },
  { id: 'policy', title: 'Policy Positions', description: 'Key policy stances and priorities' },
  { id: 'community', title: 'Community Involvement', description: 'Local connections and service' },
  { id: 'communication', title: 'Communication Style', description: 'Messaging preferences' },
  { id: 'opposition', title: 'Opposition Research', description: 'Competitive landscape' },
  { id: 'review', title: 'Review & Confirm', description: 'Review all information' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({
    personal: {
      fullName: '',
      preferredName: '',
      dateOfBirth: '',
      placeOfBirth: '',
      currentResidence: '',
      maritalStatus: 'single',
      children: 0,
      languages: ['English']
    },
    political: {
      party: '',
      yearsInPolitics: 0,
      previousOffices: [],
      politicalPhilosophy: '',
      keyEndorsements: []
    },
    professional: {
      currentOccupation: '',
      education: [],
      workExperience: [],
      professionalAchievements: []
    },
    campaign: {
      office: '',
      jurisdiction: '',
      electionDate: '',
      campaignTheme: '',
      campaignSlogan: '',
      headquarters: {
        address: '',
        phone: '',
        email: ''
      }
    },
    policyPositions: {
      topPriorities: [],
      economicPolicy: {
        taxation: '',
        spending: '',
        jobCreation: '',
        businessRegulation: ''
      },
      socialPolicy: {
        healthcare: '',
        education: '',
        socialSecurity: '',
        immigration: '',
        gunControl: '',
        abortion: '',
        lgbtqRights: ''
      },
      environmentalPolicy: {
        climateChange: '',
        energyPolicy: '',
        conservation: ''
      },
      foreignPolicy: {
        defense: '',
        trade: '',
        alliances: ''
      }
    },
    community: {
      organizations: [],
      volunteerWork: [],
      awards: [],
      localConnections: []
    },
    communication: {
      speakingStyle: 'conversational',
      keyMessages: [],
      toneAttributes: [],
      avoidTopics: [],
      preferredPlatforms: []
    },
    opposition: {
      opponents: [],
      vulnerabilities: [],
      responseStrategies: []
    }
  })

  const updateProfile = (section: keyof CandidateProfile, data: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Create campaign with comprehensive profile
      const response = await fetch('/api/campaigns/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${profile.personal?.preferredName} for ${profile.campaign?.office}`,
          candidateName: profile.personal?.fullName,
          office: profile.campaign?.office,
          district: profile.campaign?.district,
          party: profile.political?.party,
          electionDate: profile.campaign?.electionDate,
          profile: profile,
          description: profile.campaign?.campaignTheme
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const { campaign } = await response.json()
      
      toast.success('Campaign created successfully!')
      toast.success('Your comprehensive profile will enhance all AI-generated content')
      
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      toast.error('Failed to complete onboarding')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (ONBOARDING_STEPS[currentStep].id) {
      case 'personal':
        return (
          <PersonalInfoStep
            data={profile.personal!}
            onUpdate={(data) => updateProfile('personal', data)}
          />
        )
      case 'political':
        return (
          <PoliticalBackgroundStep
            data={profile.political!}
            onUpdate={(data) => updateProfile('political', data)}
          />
        )
      case 'professional':
        return (
          <ProfessionalBackgroundStep
            data={profile.professional!}
            onUpdate={(data) => updateProfile('professional', data)}
          />
        )
      case 'campaign':
        return (
          <CampaignDetailsStep
            data={profile.campaign!}
            onUpdate={(data) => updateProfile('campaign', data)}
          />
        )
      case 'policy':
        return (
          <PolicyPositionsStep
            data={profile.policyPositions!}
            onUpdate={(data) => updateProfile('policyPositions', data)}
          />
        )
      case 'community':
        return (
          <CommunityInvolvementStep
            data={profile.community!}
            onUpdate={(data) => updateProfile('community', data)}
          />
        )
      case 'communication':
        return (
          <CommunicationStyleStep
            data={profile.communication!}
            onUpdate={(data) => updateProfile('communication', data)}
          />
        )
      case 'opposition':
        return (
          <OppositionResearchStep
            data={profile.opposition!}
            onUpdate={(data) => updateProfile('opposition', data)}
          />
        )
      case 'review':
        return <ReviewStep profile={profile as CandidateProfile} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Akashic Intelligence
          </h1>
          <p className="text-lg text-gray-600">
            Let's build a comprehensive profile to power your campaign's AI-driven messaging
          </p>
        </div>

        <OnboardingProgress
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
        />

        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {ONBOARDING_STEPS[currentStep].title}
            </h2>
            <p className="text-gray-600 mt-2">
              {ONBOARDING_STEPS[currentStep].description}
            </p>
          </div>

          <div className="mb-8">
            {renderStep()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>

            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Creating Campaign...' : 'Complete Setup'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This comprehensive profile will:</p>
          <ul className="mt-2 space-y-1">
            <li>• Enhance AI-generated content with authentic candidate voice</li>
            <li>• Ensure consistent messaging across all platforms</li>
            <li>• Adapt content for different audience segments</li>
            <li>• Maintain policy consistency in all communications</li>
          </ul>
        </div>
      </div>
    </div>
  )
}