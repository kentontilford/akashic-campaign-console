'use client'

import { useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PersonalInfoData {
  fullName: string
  preferredName: string
  dateOfBirth: string
  placeOfBirth: string
  currentResidence: string
  maritalStatus: string
  children: number
  religion?: string
  languages: string[]
  photo?: string
}

interface PersonalInfoStepProps {
  data: PersonalInfoData
  onUpdate: (data: Partial<PersonalInfoData>) => void
}

export default function PersonalInfoStep({ data, onUpdate }: PersonalInfoStepProps) {
  const [newLanguage, setNewLanguage] = useState('')

  const addLanguage = () => {
    if (newLanguage && !data.languages.includes(newLanguage)) {
      onUpdate({ languages: [...data.languages, newLanguage] })
      setNewLanguage('')
    }
  }

  const removeLanguage = (language: string) => {
    onUpdate({ languages: data.languages.filter(l => l !== language) })
  }

  return (
    <div className="space-y-6">
      {/* Name Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="label">
            Full Legal Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            value={data.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            className="input"
            placeholder="John Michael Smith"
          />
        </div>

        <div>
          <label htmlFor="preferredName" className="label">
            Preferred Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="preferredName"
            value={data.preferredName}
            onChange={(e) => onUpdate({ preferredName: e.target.value })}
            className="input"
            placeholder="John"
          />
          <p className="mt-1 text-sm text-gray-500">How you want to be addressed in communications</p>
        </div>
      </div>

      {/* Birth Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dateOfBirth" className="label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={data.dateOfBirth}
            onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="placeOfBirth" className="label">
            Place of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="placeOfBirth"
            value={data.placeOfBirth}
            onChange={(e) => onUpdate({ placeOfBirth: e.target.value })}
            className="input"
            placeholder="Springfield, Illinois"
          />
        </div>
      </div>

      {/* Current Residence */}
      <div>
        <label htmlFor="currentResidence" className="label">
          Current Residence <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="currentResidence"
          value={data.currentResidence}
          onChange={(e) => onUpdate({ currentResidence: e.target.value })}
          className="input"
          placeholder="Chicago, Illinois"
        />
        <p className="mt-1 text-sm text-gray-500">City and state where you currently reside</p>
      </div>

      {/* Family Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="maritalStatus" className="label">
            Marital Status <span className="text-red-500">*</span>
          </label>
          <select
            id="maritalStatus"
            value={data.maritalStatus}
            onChange={(e) => onUpdate({ maritalStatus: e.target.value })}
            className="input"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
        </div>

        <div>
          <label htmlFor="children" className="label">
            Number of Children
          </label>
          <input
            type="number"
            id="children"
            min="0"
            value={data.children}
            onChange={(e) => onUpdate({ children: parseInt(e.target.value) || 0 })}
            className="input"
          />
        </div>
      </div>

      {/* Religion (Optional) */}
      <div>
        <label htmlFor="religion" className="label">
          Religious Affiliation (Optional)
        </label>
        <input
          type="text"
          id="religion"
          value={data.religion || ''}
          onChange={(e) => onUpdate({ religion: e.target.value })}
          className="input"
          placeholder="e.g., Catholic, Protestant, Jewish, Muslim, None"
        />
        <p className="mt-1 text-sm text-gray-500">This helps tailor messaging for faith-based communities</p>
      </div>

      {/* Languages */}
      <div>
        <label className="label">
          Languages Spoken <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
            className="input flex-1"
            placeholder="Add a language"
          />
          <button
            type="button"
            onClick={addLanguage}
            className="btn-secondary"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.languages.map((language) => (
            <span
              key={language}
              className="inline-flex items-center gap-1 px-3 py-1 bg-akashic-primary/10 text-akashic-primary rounded-full text-sm"
            >
              {language}
              <button
                type="button"
                onClick={() => removeLanguage(language)}
                className="hover:text-akashic-primary/70"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">Important for multilingual outreach</p>
      </div>

      {/* Photo Upload (Optional) */}
      <div>
        <label className="label">
          Campaign Photo (Optional)
        </label>
        <div className="mt-1 flex items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
            {data.photo ? (
              <img src={data.photo} alt="Campaign" className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-gray-400 text-3xl">👤</span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Upload a professional campaign photo</p>
            <p className="text-xs text-gray-400">This will be used in materials and profiles</p>
          </div>
        </div>
      </div>
    </div>
  )
}