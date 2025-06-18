'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface CommunityInvolvementData {
  organizations: {
    name: string
    role: string
    yearsActive: string
  }[]
  volunteerWork: string[]
  awards: {
    name: string
    organization: string
    year: number
    description: string
  }[]
  localConnections: string[]
}

interface CommunityInvolvementStepProps {
  data: CommunityInvolvementData
  onUpdate: (data: CommunityInvolvementData) => void
}

export default function CommunityInvolvementStep({ data, onUpdate }: CommunityInvolvementStepProps) {
  const [localData, setLocalData] = useState(data)

  const updateField = (field: keyof CommunityInvolvementData, value: any) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onUpdate(updated)
  }

  const addOrganization = () => {
    const newOrg = {
      name: '',
      role: '',
      yearsActive: ''
    }
    updateField('organizations', [...localData.organizations, newOrg])
  }

  const updateOrganization = (index: number, field: string, value: any) => {
    const updated = [...localData.organizations]
    updated[index] = { ...updated[index], [field]: value }
    updateField('organizations', updated)
  }

  const removeOrganization = (index: number) => {
    updateField('organizations', localData.organizations.filter((_, i) => i !== index))
  }

  const addAward = () => {
    const newAward = {
      name: '',
      organization: '',
      year: new Date().getFullYear(),
      description: ''
    }
    updateField('awards', [...localData.awards, newAward])
  }

  const updateAward = (index: number, field: string, value: any) => {
    const updated = [...localData.awards]
    updated[index] = { ...updated[index], [field]: value }
    updateField('awards', updated)
  }

  const removeAward = (index: number) => {
    updateField('awards', localData.awards.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Organizations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Community Organizations
            </label>
            <p className="text-sm text-gray-500">Civic groups, professional associations, nonprofits, etc.</p>
          </div>
          <button
            type="button"
            onClick={addOrganization}
            className="btn-secondary text-sm inline-flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Organization
          </button>
        </div>

        <div className="space-y-4">
          {localData.organizations.map((org, index) => (
            <div key={index} className="card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={org.name}
                    onChange={(e) => updateOrganization(index, 'name', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Rotary Club"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={org.role}
                    onChange={(e) => updateOrganization(index, 'role', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Board Member, Volunteer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years Active
                  </label>
                  <input
                    type="text"
                    value={org.yearsActive}
                    onChange={(e) => updateOrganization(index, 'yearsActive', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 2018-Present"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeOrganization(index)}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Work */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volunteer Work & Community Service
        </label>
        <textarea
          value={localData.volunteerWork.join('\n')}
          onChange={(e) => updateField('volunteerWork', e.target.value.split('\n').filter(v => v.trim()))}
          className="form-textarea"
          rows={4}
          placeholder="Enter each volunteer activity on a new line (e.g., Habitat for Humanity home builds, Food bank volunteer, Youth sports coach)"
        />
      </div>

      {/* Awards and Recognition */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Awards & Recognition
            </label>
            <p className="text-sm text-gray-500">Community awards, honors, and recognition</p>
          </div>
          <button
            type="button"
            onClick={addAward}
            className="btn-secondary text-sm inline-flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Award
          </button>
        </div>

        <div className="space-y-4">
          {localData.awards.map((award, index) => (
            <div key={index} className="card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Award Name
                  </label>
                  <input
                    type="text"
                    value={award.name}
                    onChange={(e) => updateAward(index, 'name', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Citizen of the Year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Awarding Organization
                  </label>
                  <input
                    type="text"
                    value={award.organization}
                    onChange={(e) => updateAward(index, 'organization', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Chamber of Commerce"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={award.year}
                    onChange={(e) => updateAward(index, 'year', parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={award.description}
                    onChange={(e) => updateAward(index, 'description', e.target.value)}
                    className="form-input"
                    placeholder="Brief description of the award"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeAward(index)}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Local Connections */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Local Connections & Roots
        </label>
        <textarea
          value={localData.localConnections.join('\n')}
          onChange={(e) => updateField('localConnections', e.target.value.split('\n').filter(c => c.trim()))}
          className="form-textarea"
          rows={4}
          placeholder="Enter each connection on a new line (e.g., Lifelong resident of district, Graduate of local high school, Family business owner for 20 years)"
        />
        <p className="mt-1 text-sm text-gray-500">
          Describe your ties to the community that demonstrate your understanding of local issues
        </p>
      </div>
    </div>
  )
}

export default CommunityInvolvementStep