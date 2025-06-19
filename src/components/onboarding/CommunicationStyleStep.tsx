'use client'

import { useState } from 'react'
import { CheckIcon } from '@/lib/icons'

interface CommunicationStyleData {
  speakingStyle: string
  keyMessages: string[]
  toneAttributes: string[]
  avoidTopics: string[]
  preferredPlatforms: string[]
}

interface CommunicationStyleStepProps {
  data: CommunicationStyleData
  onUpdate: (data: CommunicationStyleData) => void
}

const SPEAKING_STYLES = [
  { id: 'formal', label: 'Formal', description: 'Professional, structured, policy-focused' },
  { id: 'conversational', label: 'Conversational', description: 'Friendly, approachable, relatable' },
  { id: 'inspirational', label: 'Inspirational', description: 'Motivating, visionary, uplifting' },
  { id: 'direct', label: 'Direct', description: 'Straightforward, clear, no-nonsense' }
]

const TONE_ATTRIBUTES = [
  'Compassionate',
  'Strong',
  'Experienced',
  'Innovative',
  'Authentic',
  'Caring',
  'Decisive',
  'Collaborative',
  'Principled',
  'Pragmatic',
  'Optimistic',
  'Trustworthy'
]

const PLATFORMS = [
  { id: 'EMAIL', label: 'Email' },
  { id: 'FACEBOOK', label: 'Facebook' },
  { id: 'TWITTER', label: 'Twitter/X' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'PRESS_RELEASE', label: 'Press Releases' },
  { id: 'WEBSITE', label: 'Website' },
  { id: 'SMS', label: 'Text Messages' }
]

export default function CommunicationStyleStep({ data, onUpdate }: CommunicationStyleStepProps) {
  const [localData, setLocalData] = useState(data)

  const updateField = (field: keyof CommunicationStyleData, value: any) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onUpdate(updated)
  }

  const toggleToneAttribute = (attribute: string) => {
    const current = localData.toneAttributes
    if (current.includes(attribute)) {
      updateField('toneAttributes', current.filter(a => a !== attribute))
    } else {
      updateField('toneAttributes', [...current, attribute])
    }
  }

  const togglePlatform = (platform: string) => {
    const current = localData.preferredPlatforms
    if (current.includes(platform)) {
      updateField('preferredPlatforms', current.filter(p => p !== platform))
    } else {
      updateField('preferredPlatforms', [...current, platform])
    }
  }

  return (
    <div className="space-y-6">
      {/* Speaking Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Speaking Style
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPEAKING_STYLES.map(style => (
            <label
              key={style.id}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                localData.speakingStyle === style.id
                  ? 'border-akashic-primary bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="speakingStyle"
                value={style.id}
                checked={localData.speakingStyle === style.id}
                onChange={() => updateField('speakingStyle', style.id)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{style.label}</p>
                  <p className="text-gray-500">{style.description}</p>
                </div>
              </div>
              {localData.speakingStyle === style.id && (
                <CheckIcon className="h-5 w-5 text-akashic-primary absolute top-4 right-4" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Key Messages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Key Campaign Messages
        </label>
        <textarea
          value={localData.keyMessages.join('\n')}
          onChange={(e) => updateField('keyMessages', e.target.value.split('\n').filter(m => m.trim()))}
          className="form-textarea"
          rows={4}
          placeholder="Enter your 3-5 core campaign messages, one per line (e.g., Fighting for working families, Bringing jobs back home)"
        />
        <p className="mt-1 text-sm text-gray-500">
          These messages will be woven into all your communications
        </p>
      </div>

      {/* Tone Attributes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Tone Attributes
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select 3-5 attributes that best describe how you want to be perceived
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TONE_ATTRIBUTES.map(attribute => (
            <label
              key={attribute}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-akashic-primary focus:ring-akashic-primary border-gray-300 rounded"
                checked={localData.toneAttributes.includes(attribute)}
                onChange={() => toggleToneAttribute(attribute)}
              />
              <span className="ml-2 text-sm font-medium text-gray-900">{attribute}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Topics to Avoid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topics to Avoid
        </label>
        <textarea
          value={localData.avoidTopics.join('\n')}
          onChange={(e) => updateField('avoidTopics', e.target.value.split('\n').filter(t => t.trim()))}
          className="form-textarea"
          rows={3}
          placeholder="Enter sensitive topics to avoid or handle carefully, one per line"
        />
        <p className="mt-1 text-sm text-gray-500">
          AI will avoid or carefully handle these topics in generated content
        </p>
      </div>

      {/* Preferred Platforms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Preferred Communication Platforms
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select the platforms where you plan to be most active
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PLATFORMS.map(platform => (
            <label
              key={platform.id}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-akashic-primary focus:ring-akashic-primary border-gray-300 rounded"
                checked={localData.preferredPlatforms.includes(platform.id)}
                onChange={() => togglePlatform(platform.id)}
              />
              <span className="ml-2 text-sm font-medium text-gray-900">{platform.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

