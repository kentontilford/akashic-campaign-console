'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface PoliticalBackgroundData {
  party: string
  yearsInPolitics: number
  previousOffices: {
    title: string
    organization: string
    startYear: number
    endYear: number
    achievements: string[]
  }[]
  politicalPhilosophy: string
  keyEndorsements: {
    name: string
    title: string
    organization: string
    quote?: string
  }[]
}

interface PoliticalBackgroundStepProps {
  data: PoliticalBackgroundData
  onUpdate: (data: PoliticalBackgroundData) => void
}

export default function PoliticalBackgroundStep({ data, onUpdate }: PoliticalBackgroundStepProps) {
  const [localData, setLocalData] = useState(data)

  const updateField = (field: keyof PoliticalBackgroundData, value: any) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onUpdate(updated)
  }

  const addPreviousOffice = () => {
    const newOffice = {
      title: '',
      organization: '',
      startYear: new Date().getFullYear() - 1,
      endYear: new Date().getFullYear(),
      achievements: []
    }
    updateField('previousOffices', [...localData.previousOffices, newOffice])
  }

  const updatePreviousOffice = (index: number, field: string, value: any) => {
    const updated = [...localData.previousOffices]
    updated[index] = { ...updated[index], [field]: value }
    updateField('previousOffices', updated)
  }

  const removePreviousOffice = (index: number) => {
    updateField('previousOffices', localData.previousOffices.filter((_, i) => i !== index))
  }

  const addEndorsement = () => {
    const newEndorsement = {
      name: '',
      title: '',
      organization: '',
      quote: ''
    }
    updateField('keyEndorsements', [...localData.keyEndorsements, newEndorsement])
  }

  const updateEndorsement = (index: number, field: string, value: any) => {
    const updated = [...localData.keyEndorsements]
    updated[index] = { ...updated[index], [field]: value }
    updateField('keyEndorsements', updated)
  }

  const removeEndorsement = (index: number) => {
    updateField('keyEndorsements', localData.keyEndorsements.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Party Affiliation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Party Affiliation
        </label>
        <select
          value={localData.party}
          onChange={(e) => updateField('party', e.target.value)}
          className="form-select"
        >
          <option value="">Select Party</option>
          <option value="Democratic">Democratic</option>
          <option value="Republican">Republican</option>
          <option value="Independent">Independent</option>
          <option value="Green">Green</option>
          <option value="Libertarian">Libertarian</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Years in Politics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years in Politics
        </label>
        <input
          type="number"
          min="0"
          value={localData.yearsInPolitics}
          onChange={(e) => updateField('yearsInPolitics', parseInt(e.target.value) || 0)}
          className="form-input"
          placeholder="0"
        />
      </div>

      {/* Previous Offices */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Previous Political Offices
          </label>
          <button
            type="button"
            onClick={addPreviousOffice}
            className="btn-secondary text-sm inline-flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Office
          </button>
        </div>

        <div className="space-y-4">
          {localData.previousOffices.map((office, index) => (
            <div key={index} className="card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Title
                  </label>
                  <input
                    type="text"
                    value={office.title}
                    onChange={(e) => updatePreviousOffice(index, 'title', e.target.value)}
                    className="form-input"
                    placeholder="e.g., City Council Member"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={office.organization}
                    onChange={(e) => updatePreviousOffice(index, 'organization', e.target.value)}
                    className="form-input"
                    placeholder="e.g., City of Springfield"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Year
                  </label>
                  <input
                    type="number"
                    value={office.startYear}
                    onChange={(e) => updatePreviousOffice(index, 'startYear', parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Year
                  </label>
                  <input
                    type="number"
                    value={office.endYear}
                    onChange={(e) => updatePreviousOffice(index, 'endYear', parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Achievements
                </label>
                <textarea
                  value={office.achievements.join('\n')}
                  onChange={(e) => updatePreviousOffice(index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter each achievement on a new line"
                />
              </div>

              <button
                type="button"
                onClick={() => removePreviousOffice(index)}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Political Philosophy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Political Philosophy
        </label>
        <textarea
          value={localData.politicalPhilosophy}
          onChange={(e) => updateField('politicalPhilosophy', e.target.value)}
          className="form-textarea"
          rows={4}
          placeholder="Describe your political beliefs and approach to governance..."
        />
      </div>

      {/* Key Endorsements */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Key Endorsements
          </label>
          <button
            type="button"
            onClick={addEndorsement}
            className="btn-secondary text-sm inline-flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Endorsement
          </button>
        </div>

        <div className="space-y-4">
          {localData.keyEndorsements.map((endorsement, index) => (
            <div key={index} className="card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={endorsement.name}
                    onChange={(e) => updateEndorsement(index, 'name', e.target.value)}
                    className="form-input"
                    placeholder="Endorser's name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={endorsement.title}
                    onChange={(e) => updateEndorsement(index, 'title', e.target.value)}
                    className="form-input"
                    placeholder="Their title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={endorsement.organization}
                    onChange={(e) => updateEndorsement(index, 'organization', e.target.value)}
                    className="form-input"
                    placeholder="Their organization"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endorsement Quote (Optional)
                </label>
                <textarea
                  value={endorsement.quote || ''}
                  onChange={(e) => updateEndorsement(index, 'quote', e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Their endorsement message..."
                />
              </div>

              <button
                type="button"
                onClick={() => removeEndorsement(index)}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PoliticalBackgroundStep