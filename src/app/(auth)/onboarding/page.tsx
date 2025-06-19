'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@/lib/icons'
import { CandidateProfile } from '@/types/campaign-profile'
import toast from 'react-hot-toast'

interface OnboardingQuestion {
  id: string
  category: keyof CandidateProfile
  field: string
  question: string
  description?: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'array'
  options?: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  validation?: (value: any) => boolean
}

// Define all onboarding questions in order
const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // Personal Information
  {
    id: 'fullName',
    category: 'personal',
    field: 'fullName',
    question: "What's your full legal name?",
    description: "This is how you'll appear on the ballot.",
    type: 'text',
    placeholder: 'John Robert Smith',
    required: true
  },
  {
    id: 'preferredName',
    category: 'personal',
    field: 'preferredName',
    question: "What name do you prefer to go by?",
    description: "This is how we'll address you in communications.",
    type: 'text',
    placeholder: 'John',
    required: true
  },
  {
    id: 'dateOfBirth',
    category: 'personal',
    field: 'dateOfBirth',
    question: "When were you born?",
    type: 'date',
    required: true
  },
  {
    id: 'currentResidence',
    category: 'personal',
    field: 'currentResidence',
    question: "Where do you currently live?",
    description: "Your city and state of residence.",
    type: 'text',
    placeholder: 'Columbus, Ohio',
    required: true
  },
  {
    id: 'personalStory',
    category: 'personal',
    field: 'personalStory',
    question: "Tell us your personal story",
    description: "Share your background, what shaped you, and why you're running. This helps create authentic messaging.",
    type: 'textarea',
    placeholder: 'I grew up in a working-class family in Ohio. My parents taught me the value of hard work and community service...',
    required: true
  },
  
  // Political Background
  {
    id: 'party',
    category: 'political',
    field: 'party',
    question: "What's your political party affiliation?",
    type: 'select',
    options: [
      { value: 'Democratic', label: 'Democratic Party' },
      { value: 'Republican', label: 'Republican Party' },
      { value: 'Independent', label: 'Independent' },
      { value: 'Green', label: 'Green Party' },
      { value: 'Libertarian', label: 'Libertarian Party' },
      { value: 'Other', label: 'Other' }
    ],
    required: true
  },
  {
    id: 'politicalPhilosophy',
    category: 'political',
    field: 'politicalPhilosophy',
    question: "How would you describe your political philosophy?",
    description: "What are your core political beliefs and values?",
    type: 'textarea',
    placeholder: 'I believe in pragmatic solutions that bring people together. Government should work for everyone, not just special interests...',
    required: true
  },
  {
    id: 'whyRunning',
    category: 'political',
    field: 'whyRunning',
    question: "Why are you running for office?",
    description: "What motivated you to run? What do you hope to accomplish?",
    type: 'textarea',
    placeholder: "I'm running because our community deserves better. I've seen firsthand how current policies are failing working families...",
    required: true
  },
  
  // Campaign Details
  {
    id: 'office',
    category: 'campaign',
    field: 'office',
    question: "What office are you running for?",
    type: 'text',
    placeholder: 'U.S. House of Representatives',
    required: true
  },
  {
    id: 'jurisdiction',
    category: 'campaign',
    field: 'jurisdiction',
    question: "What's your campaign jurisdiction?",
    description: "State, district, or locality",
    type: 'text',
    placeholder: 'Ohio\'s 3rd Congressional District',
    required: true
  },
  {
    id: 'campaignTheme',
    category: 'campaign',
    field: 'campaignTheme',
    question: "What's your campaign theme?",
    description: "The central message that defines your campaign",
    type: 'text',
    placeholder: 'Fighting for Working Families',
    required: true
  },
  {
    id: 'campaignSlogan',
    category: 'campaign',
    field: 'campaignSlogan',
    question: "What's your campaign slogan?",
    description: "A short, memorable phrase for your campaign",
    type: 'text',
    placeholder: 'Progress for All',
    required: true
  },
  
  // Top Policy Priorities
  {
    id: 'topPriority1',
    category: 'policyPositions',
    field: 'topPriority1',
    question: "What's your #1 policy priority?",
    description: "Describe your most important policy goal and why it matters",
    type: 'textarea',
    placeholder: 'Healthcare: Every American deserves access to affordable, quality healthcare. I will fight to expand coverage and lower costs...',
    required: true
  },
  {
    id: 'topPriority2',
    category: 'policyPositions',
    field: 'topPriority2',
    question: "What's your second policy priority?",
    description: "Your second most important issue",
    type: 'textarea',
    placeholder: 'Jobs and Economy: We need to create good-paying jobs and support small businesses...',
    required: true
  },
  {
    id: 'topPriority3',
    category: 'policyPositions',
    field: 'topPriority3',
    question: "What's your third policy priority?",
    description: "Your third key issue",
    type: 'textarea',
    placeholder: 'Education: Investing in our schools and making college affordable...',
    required: true
  },
  
  // Key Policy Positions
  {
    id: 'economyPosition',
    category: 'policyPositions',
    field: 'economyPosition',
    question: "What's your position on the economy and jobs?",
    description: "Your stance on economic policy, job creation, and business",
    type: 'textarea',
    placeholder: 'I believe in an economy that works for everyone. This means supporting small businesses, raising the minimum wage...',
    required: true
  },
  {
    id: 'healthcarePosition',
    category: 'policyPositions',
    field: 'healthcarePosition',
    question: "What's your position on healthcare?",
    type: 'textarea',
    placeholder: 'Healthcare is a human right. I support expanding access to affordable healthcare...',
    required: true
  },
  {
    id: 'educationPosition',
    category: 'policyPositions',
    field: 'educationPosition',
    question: "What's your position on education?",
    type: 'textarea',
    placeholder: 'Every child deserves a quality education. I support increasing teacher pay, reducing class sizes...',
    required: true
  },
  {
    id: 'environmentPosition',
    category: 'policyPositions',
    field: 'environmentPosition',
    question: "What's your position on climate and environment?",
    type: 'textarea',
    placeholder: 'Climate change is real and we must act now. I support clean energy jobs and protecting our environment...',
    required: true
  },
  
  // Communication Style
  {
    id: 'speakingStyle',
    category: 'communication',
    field: 'speakingStyle',
    question: "How would you describe your speaking style?",
    type: 'select',
    options: [
      { value: 'conversational', label: 'Conversational - Like talking to a neighbor' },
      { value: 'inspirational', label: 'Inspirational - Motivating and uplifting' },
      { value: 'direct', label: 'Direct - Straight to the point' },
      { value: 'professorial', label: 'Professorial - Educational and detailed' },
      { value: 'compassionate', label: 'Compassionate - Warm and empathetic' }
    ],
    required: true
  },
  {
    id: 'keyMessages',
    category: 'communication',
    field: 'keyMessages',
    question: "What key messages do you always want to convey?",
    description: "List 3-5 core messages that should appear in all communications",
    type: 'textarea',
    placeholder: "1. I'm fighting for working families\n2. Healthcare is a human right\n3. We need to invest in good-paying jobs\n4. Education is the key to opportunity",
    required: true
  },
  {
    id: 'avoidTopics',
    category: 'communication',
    field: 'avoidTopics',
    question: "Are there any topics or phrases to avoid?",
    description: "Things you don't want to discuss or language to avoid",
    type: 'textarea',
    placeholder: "Avoid discussing specific pending legislation until position is finalized..."
  },
  
  // Opposition Research
  {
    id: 'mainOpponent',
    category: 'opposition',
    field: 'mainOpponent',
    question: "Who is your main opponent?",
    description: "Name and party affiliation",
    type: 'text',
    placeholder: 'Jane Doe (Republican)'
  },
  {
    id: 'keyDifferences',
    category: 'opposition',
    field: 'keyDifferences',
    question: "What are the key differences between you and your opponent?",
    description: "Policy differences and contrasts",
    type: 'textarea',
    placeholder: 'While my opponent wants to cut healthcare, I want to expand it. They side with special interests, I fight for working families...'
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Animation variants
  const questionVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const progressPercentage = ((currentQuestion + 1) / ONBOARDING_QUESTIONS.length) * 100

  const currentQ = ONBOARDING_QUESTIONS[currentQuestion]
  const currentValue = answers[currentQ.id] || ''

  const handleNext = () => {
    if (currentQ.required && !currentValue) {
      toast.error('Please answer this question before continuing')
      return
    }
    
    if (currentQuestion < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleAnswerChange = (value: any) => {
    setAnswers({ ...answers, [currentQ.id]: value })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Transform answers into CandidateProfile structure
      const profile: CandidateProfile = {
        personal: {
          fullName: answers.fullName || '',
          preferredName: answers.preferredName || '',
          dateOfBirth: answers.dateOfBirth || '',
          placeOfBirth: '',
          currentResidence: answers.currentResidence || '',
          maritalStatus: '',
          children: 0,
          languages: ['English'],
          personalStory: answers.personalStory || ''
        },
        political: {
          party: answers.party || '',
          yearsInPolitics: 0,
          previousOffices: [],
          politicalPhilosophy: answers.politicalPhilosophy || '',
          keyEndorsements: [],
          whyRunning: answers.whyRunning || ''
        },
        professional: {
          currentOccupation: '',
          education: [],
          workExperience: [],
          professionalAchievements: []
        },
        campaign: {
          office: answers.office || '',
          jurisdiction: answers.jurisdiction || '',
          electionDate: '',
          campaignTheme: answers.campaignTheme || '',
          campaignSlogan: answers.campaignSlogan || '',
          headquarters: {
            address: '',
            phone: '',
            email: ''
          }
        },
        policyPositions: {
          topPriorities: [
            answers.topPriority1 && {
              issue: answers.topPriority1.split(':')[0] || 'Priority 1',
              position: answers.topPriority1,
              keyPoints: []
            },
            answers.topPriority2 && {
              issue: answers.topPriority2.split(':')[0] || 'Priority 2',
              position: answers.topPriority2,
              keyPoints: []
            },
            answers.topPriority3 && {
              issue: answers.topPriority3.split(':')[0] || 'Priority 3',
              position: answers.topPriority3,
              keyPoints: []
            }
          ].filter(Boolean),
          economicPolicy: {
            taxation: answers.economyPosition || '',
            spending: answers.economyPosition || '',
            jobCreation: answers.economyPosition || '',
            businessRegulation: ''
          },
          socialPolicy: {
            healthcare: answers.healthcarePosition || '',
            education: answers.educationPosition || '',
            socialSecurity: '',
            immigration: '',
            gunControl: '',
            abortion: '',
            lgbtqRights: ''
          },
          environmentalPolicy: {
            climateChange: answers.environmentPosition || '',
            energyPolicy: answers.environmentPosition || '',
            conservation: answers.environmentPosition || ''
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
          speakingStyle: answers.speakingStyle || 'conversational',
          keyMessages: answers.keyMessages ? answers.keyMessages.split('\n').filter(Boolean) : [],
          toneAttributes: [],
          avoidTopics: answers.avoidTopics ? answers.avoidTopics.split('\n').filter(Boolean) : [],
          preferredPlatforms: []
        },
        opposition: {
          opponents: answers.mainOpponent ? [{
            name: answers.mainOpponent,
            party: answers.mainOpponent.match(/\((.*?)\)/)?.[1] || '',
            strengths: [],
            weaknesses: [],
            keyDifferences: answers.keyDifferences ? [answers.keyDifferences] : []
          }] : [],
          vulnerabilities: [],
          responseStrategies: []
        },
        fundraising: {
          goalAmount: 0,
          currentAmount: 0,
          majorDonors: [],
          fundraisingEvents: []
        },
        demographics: {
          districtPopulation: 0,
          registeredVoters: 0,
          historicalTurnout: 0,
          keyDemographics: [],
          previousElectionResults: []
        }
      }

      // Create campaign with profile
      const campaignData = {
        name: `${answers.preferredName || answers.fullName} for ${answers.office}`,
        candidateName: answers.fullName,
        office: answers.office,
        district: answers.jurisdiction,
        party: answers.party,
        description: answers.campaignTheme,
        profile
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) throw new Error('Failed to create campaign')

      const campaign = await response.json()
      
      toast.success('Campaign created successfully!')
      router.push(`/campaigns/${campaign.id}`)
      
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete onboarding. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderInput = () => {
    switch (currentQ.type) {
      case 'textarea':
        return (
          <textarea
            value={currentValue}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQ.placeholder}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-akashic-primary focus:border-transparent resize-none"
            rows={6}
          />
        )
      
      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-akashic-primary focus:border-transparent"
          >
            <option value="">Choose an option...</option>
            {currentQ.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={currentValue}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-akashic-primary focus:border-transparent"
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQ.placeholder}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-akashic-primary focus:border-transparent"
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-akashic-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Let's Build Your Campaign
          </h1>
          <p className="text-lg text-gray-600">
            Question {currentQuestion + 1} of {ONBOARDING_QUESTIONS.length}
          </p>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {currentQ.question}
            </h2>
            
            {currentQ.description && (
              <p className="text-lg text-gray-600 mb-8">
                {currentQ.description}
              </p>
            )}

            <div className="mb-8">
              {renderInput()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentQuestion === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-akashic-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {currentQuestion === ONBOARDING_QUESTIONS.length - 1 ? (
                  isSubmitting ? 'Creating Campaign...' : 'Complete Setup'
                ) : (
                  <>
                    Next
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip for now */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}