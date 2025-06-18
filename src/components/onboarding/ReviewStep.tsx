'use client'

import { CandidateProfile } from '@/types/campaign-profile'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

interface ReviewStepProps {
  profile: CandidateProfile
}

export default function ReviewStep({ profile }: ReviewStepProps) {
  const completedSections = [
    { name: 'Personal Information', complete: !!profile.personal?.fullName },
    { name: 'Political Background', complete: !!profile.political?.party },
    { name: 'Professional Background', complete: !!profile.professional?.currentOccupation },
    { name: 'Campaign Details', complete: !!profile.campaign?.office },
    { name: 'Policy Positions', complete: profile.policyPositions?.topPriorities?.length > 0 },
    { name: 'Community Involvement', complete: profile.community?.organizations?.length > 0 || profile.community?.volunteerWork?.length > 0 },
    { name: 'Communication Style', complete: !!profile.communication?.speakingStyle },
    { name: 'Opposition Research', complete: profile.opposition?.opponents?.length > 0 || profile.opposition?.vulnerabilities?.length > 0 }
  ]

  const completionRate = Math.round((completedSections.filter(s => s.complete).length / completedSections.length) * 100)

  return (
    <div className="space-y-6">
      {/* Completion Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Completion</h3>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-akashic-primary h-2.5 rounded-full" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {completedSections.map((section) => (
            <div key={section.name} className="flex items-center">
              <CheckCircleIcon 
                className={`h-5 w-5 mr-2 ${section.complete ? 'text-green-500' : 'text-gray-300'}`} 
              />
              <span className={`text-sm ${section.complete ? 'text-gray-900' : 'text-gray-500'}`}>
                {section.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="space-y-6">
        {/* Personal Information */}
        {profile.personal?.fullName && (
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{profile.personal.preferredName || profile.personal.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Residence</dt>
                <dd className="text-sm text-gray-900">{profile.personal.currentResidence}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Languages</dt>
                <dd className="text-sm text-gray-900">{profile.personal.languages.join(', ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Family</dt>
                <dd className="text-sm text-gray-900">
                  {profile.personal.maritalStatus}, {profile.personal.children} children
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Campaign Details */}
        {profile.campaign?.office && (
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-3">Campaign Details</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Office</dt>
                <dd className="text-sm text-gray-900">{profile.campaign.office}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">District</dt>
                <dd className="text-sm text-gray-900">{profile.campaign.district || profile.campaign.jurisdiction}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Campaign Theme</dt>
                <dd className="text-sm text-gray-900">{profile.campaign.campaignTheme}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Slogan</dt>
                <dd className="text-sm text-gray-900 italic">&quot;{profile.campaign.campaignSlogan}&quot;</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Political Background */}
        {profile.political?.party && (
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-3">Political Background</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Party</dt>
                <dd className="text-sm text-gray-900">{profile.political.party}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Experience</dt>
                <dd className="text-sm text-gray-900">{profile.political.yearsInPolitics} years in politics</dd>
              </div>
              {profile.political.previousOffices.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Previous Offices</dt>
                  <dd className="text-sm text-gray-900">
                    {profile.political.previousOffices.map(office => office.title).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Top Policy Priorities */}
        {profile.policyPositions?.topPriorities?.length > 0 && (
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-3">Top Policy Priorities</h4>
            <ol className="list-decimal list-inside space-y-2">
              {profile.policyPositions.topPriorities.map((priority, index) => (
                <li key={index} className="text-sm text-gray-900">
                  <span className="font-medium">{priority.issue}</span>
                  {priority.position && (
                    <p className="ml-5 mt-1 text-gray-600">{priority.position}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Communication Preferences */}
        {profile.communication?.speakingStyle && (
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-3">Communication Style</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Speaking Style</dt>
                <dd className="text-sm text-gray-900 capitalize">{profile.communication.speakingStyle}</dd>
              </div>
              {profile.communication.toneAttributes.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tone Attributes</dt>
                  <dd className="text-sm text-gray-900">{profile.communication.toneAttributes.join(', ')}</dd>
                </div>
              )}
              {profile.communication.keyMessages.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Key Messages</dt>
                  <dd className="text-sm text-gray-900">
                    <ul className="list-disc list-inside">
                      {profile.communication.keyMessages.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* AI Enhancement Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">AI-Enhanced Messaging</h4>
        <p className="text-sm text-blue-700">
          Your comprehensive profile will power our AI system to generate highly personalized, 
          audience-specific messages that maintain your authentic voice while adapting to different 
          voter segments.
        </p>
      </div>

      {/* Version Control Preview */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">Version Control Active</h4>
        <p className="text-sm text-green-700 mb-3">
          Your messages will be automatically adapted for these audience profiles:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['Union', 'Chamber', 'Youth', 'Senior', 'Rural', 'Urban'].map(profile => (
            <div key={profile} className="bg-white px-3 py-1 rounded text-sm text-green-800 text-center">
              {profile}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}