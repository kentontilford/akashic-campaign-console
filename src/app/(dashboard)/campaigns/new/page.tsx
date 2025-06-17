'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { VersionControlEngine } from '@/lib/version-control'

const steps = [
  { id: 'basics', name: 'Campaign Basics' },
  { id: 'candidate', name: 'Candidate Profile' },
  { id: 'audience', name: 'Target Audience' },
  { id: 'review', name: 'Review & Create' }
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // Campaign Basics
    name: '',
    description: '',
    candidateName: '',
    office: '',
    district: '',
    party: '',
    electionDate: '',
    
    // Candidate Profile
    age: '',
    background: [] as string[],
    strengths: [] as string[],
    vulnerabilities: [] as string[],
    
    // Communication Style
    tone: 'conversational',
    complexity: 'moderate',
    preferredTopics: [] as string[],
    avoidTopics: [] as string[],
    
    // Policy Positions
    economy: { position: 'moderate', details: '' },
    healthcare: { position: 'moderate', details: '' },
    education: { position: 'moderate', details: '' },
    environment: { position: 'moderate', details: '' },
    
    // Version Profiles
    selectedProfiles: ['union', 'chamber', 'youth', 'senior', 'rural', 'urban']
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          candidateName: formData.candidateName,
          office: formData.office,
          district: formData.district,
          party: formData.party,
          electionDate: formData.electionDate || null,
          profile: {
            basic: {
              age: parseInt(formData.age) || null,
              background: formData.background,
              strengths: formData.strengths,
              vulnerabilities: formData.vulnerabilities
            },
            communication: {
              tone: formData.tone,
              complexity: formData.complexity,
              preferredTopics: formData.preferredTopics,
              avoidTopics: formData.avoidTopics
            },
            policy: {
              economy: formData.economy,
              healthcare: formData.healthcare,
              education: formData.education,
              environment: formData.environment
            }
          },
          versionProfiles: VersionControlEngine.getDefaultProfiles().filter(
            profile => formData.selectedProfiles.includes(profile.id)
          )
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const campaign = await response.json()
      toast.success('Campaign created successfully!')
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      toast.error('Failed to create campaign')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Campaign</h1>
      
      {/* Progress Steps */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li key={step.id} className={index !== steps.length - 1 ? 'flex-1' : ''}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index < currentStep
                      ? 'bg-akashic-primary text-white'
                      : index === currentStep
                      ? 'bg-akashic-primary text-white ring-4 ring-akashic-primary/20'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      index < currentStep ? 'bg-akashic-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">{step.name}</p>
            </li>
          ))}
        </ol>
      </nav>

      {/* Form Content */}
      <div className="card">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Campaign Basics</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
              <input
                type="text"
                className="input mt-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Smith for Senate 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="input mt-1"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the campaign"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Candidate Name</label>
                <input
                  type="text"
                  className="input mt-1"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Office</label>
                <input
                  type="text"
                  className="input mt-1"
                  value={formData.office}
                  onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                  placeholder="e.g., U.S. Senate, Mayor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">District/Area</label>
                <input
                  type="text"
                  className="input mt-1"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g., State-wide, District 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Party</label>
                <select
                  className="input mt-1"
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                >
                  <option value="">Select party</option>
                  <option value="Democrat">Democrat</option>
                  <option value="Republican">Republican</option>
                  <option value="Independent">Independent</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Election Date</label>
                <input
                  type="date"
                  className="input mt-1"
                  value={formData.electionDate}
                  onChange={(e) => setFormData({ ...formData, electionDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Candidate Profile</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                className="input mt-1"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Candidate age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Communication Tone</label>
              <select
                className="input mt-1"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              >
                <option value="professional">Professional</option>
                <option value="conversational">Conversational</option>
                <option value="passionate">Passionate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message Complexity</label>
              <select
                className="input mt-1"
                value={formData.complexity}
                onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Target Audience Profiles</h2>
            <p className="text-sm text-gray-600">Select the audience profiles relevant to your campaign</p>
            
            <div className="space-y-3">
              {VersionControlEngine.getDefaultProfiles().map((profile) => (
                <label
                  key={profile.id}
                  className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-akashic-primary focus:ring-akashic-primary border-gray-300 rounded"
                    checked={formData.selectedProfiles.includes(profile.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          selectedProfiles: [...formData.selectedProfiles, profile.id]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          selectedProfiles: formData.selectedProfiles.filter(id => id !== profile.id)
                        })
                      }
                    }}
                  />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{profile.name}</h4>
                    <p className="text-sm text-gray-500">{profile.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Review & Create</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Campaign Details</h3>
                <dl className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Name:</dt>
                    <dd className="text-gray-900">{formData.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Candidate:</dt>
                    <dd className="text-gray-900">{formData.candidateName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Office:</dt>
                    <dd className="text-gray-900">{formData.office}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Party:</dt>
                    <dd className="text-gray-900">{formData.party || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Target Audiences</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.selectedProfiles.map(profileId => {
                    const profile = VersionControlEngine.getDefaultProfiles().find(p => p.id === profileId)
                    return profile ? (
                      <span key={profile.id} className="text-xs bg-akashic-primary/10 text-akashic-primary px-2 py-1 rounded">
                        {profile.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}