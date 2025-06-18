'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface ProfessionalBackgroundData {
  currentOccupation: string
  education: {
    degree: string
    institution: string
    graduationYear: number
    honors?: string
  }[]
  workExperience: {
    title: string
    company: string
    startYear: number
    endYear?: number
    description: string
  }[]
  militaryService?: {
    branch: string
    rank: string
    years: string
    honors: string[]
  }
  professionalAchievements: string[]
}

interface ProfessionalBackgroundStepProps {
  data: ProfessionalBackgroundData
  onUpdate: (data: ProfessionalBackgroundData) => void
}

export default function ProfessionalBackgroundStep({ data, onUpdate }: ProfessionalBackgroundStepProps) {
  const [localData, setLocalData] = useState(data)
  const [hasMilitaryService, setHasMilitaryService] = useState(!!data.militaryService)

  const updateField = (field: keyof ProfessionalBackgroundData, value: any) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onUpdate(updated)
  }

  const addEducation = () => {
    const newEducation = {
      degree: '',
      institution: '',
      graduationYear: new Date().getFullYear() - 4,
      honors: ''
    }
    updateField('education', [...localData.education, newEducation])
  }

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...localData.education]
    updated[index] = { ...updated[index], [field]: value }
    updateField('education', updated)
  }

  const removeEducation = (index: number) => {
    updateField('education', localData.education.filter((_, i) => i !== index))
  }

  const addWorkExperience = () => {
    const newExperience = {
      title: '',
      company: '',
      startYear: new Date().getFullYear() - 1,
      endYear: undefined,
      description: ''
    }
    updateField('workExperience', [...localData.workExperience, newExperience])
  }

  const updateWorkExperience = (index: number, field: string, value: any) => {
    const updated = [...localData.workExperience]
    updated[index] = { ...updated[index], [field]: value }
    updateField('workExperience', updated)
  }

  const removeWorkExperience = (index: number) => {
    updateField('workExperience', localData.workExperience.filter((_, i) => i !== index))
  }

  const toggleMilitaryService = () => {
    if (hasMilitaryService) {
      updateField('militaryService', undefined)
      setHasMilitaryService(false)
    } else {
      updateField('militaryService', {
        branch: '',
        rank: '',
        years: '',
        honors: []
      })
      setHasMilitaryService(true)
    }
  }

  const updateMilitaryService = (field: string, value: any) => {
    if (localData.militaryService) {
      updateField('militaryService', { ...localData.militaryService, [field]: value })
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Occupation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Occupation
        </label>
        <input
          type="text"
          value={localData.currentOccupation}
          onChange={(e) => updateField('currentOccupation', e.target.value)}
          className="form-input"
          placeholder="e.g., Small Business Owner, Attorney, Teacher"
        />
      </div>

      {/* Education */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Education
          </label>
          <button
            type="button"
            onClick={addEducation}
            className="btn-secondary text-sm inline-flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Education
          </button>
        </div>

        <div className="space-y-4">
          {localData.education.map((edu, index) => (
            <div key={index} className="card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Bachelor of Arts, JD, MBA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="form-input"
                    placeholder="e.g., State University"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={edu.graduationYear}
                    onChange={(e) => updateEducation(index, 'graduationYear', parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Honors (Optional)
                  </label>
                  <input
                    type="text"
                    value={edu.honors || ''}
                    onChange={(e) => updateEducation(index, 'honors', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Magna Cum Laude, Dean's List"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Work Experience */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Work Experience
          </label>
          <button
            type="button"
            onClick={addWorkExperience}
            className="btn-secondary text-sm inline-flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Experience
          </button>
        </div>

        <div className="space-y-4">
          {localData.workExperience.map((exp, index) => (
            <div key={index} className="card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Regional Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                    className="form-input"
                    placeholder="e.g., ABC Corporation"
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
                    value={exp.startYear}
                    onChange={(e) => updateWorkExperience(index, 'startYear', parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Year (Leave blank if current)
                  </label>
                  <input
                    type="number"
                    value={exp.endYear || ''}
                    onChange={(e) => updateWorkExperience(index, 'endYear', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="form-input"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="Current"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe your role and key responsibilities..."
                />
              </div>

              <button
                type="button"
                onClick={() => removeWorkExperience(index)}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Military Service */}
      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="military-service"
            checked={hasMilitaryService}
            onChange={toggleMilitaryService}
            className="h-4 w-4 text-akashic-primary focus:ring-akashic-primary border-gray-300 rounded"
          />
          <label htmlFor="military-service" className="ml-2 text-sm font-medium text-gray-700">
            I have served in the military
          </label>
        </div>

        {hasMilitaryService && localData.militaryService && (
          <div className="card p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  value={localData.militaryService.branch}
                  onChange={(e) => updateMilitaryService('branch', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Branch</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                  <option value="Marines">Marines</option>
                  <option value="Coast Guard">Coast Guard</option>
                  <option value="Space Force">Space Force</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rank
                </label>
                <input
                  type="text"
                  value={localData.militaryService.rank}
                  onChange={(e) => updateMilitaryService('rank', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Captain, Sergeant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Service
                </label>
                <input
                  type="text"
                  value={localData.militaryService.years}
                  onChange={(e) => updateMilitaryService('years', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 2015-2020"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Honors & Commendations
              </label>
              <textarea
                value={localData.militaryService.honors.join('\n')}
                onChange={(e) => updateMilitaryService('honors', e.target.value.split('\n').filter(h => h.trim()))}
                className="form-textarea"
                rows={3}
                placeholder="Enter each honor on a new line"
              />
            </div>
          </div>
        )}
      </div>

      {/* Professional Achievements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Achievements
        </label>
        <textarea
          value={localData.professionalAchievements.join('\n')}
          onChange={(e) => updateField('professionalAchievements', e.target.value.split('\n').filter(a => a.trim()))}
          className="form-textarea"
          rows={4}
          placeholder="Enter each achievement on a new line (e.g., Industry awards, certifications, notable projects)"
        />
      </div>
    </div>
  )
}

