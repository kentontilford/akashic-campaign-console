'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface OppositionResearchData {
  opponents: {
    name: string
    party: string
    strengths: string[]
    weaknesses: string[]
    keyDifferences: string[]
  }[]
  vulnerabilities: string[]
  responseStrategies: string[]
}

interface OppositionResearchStepProps {
  data: OppositionResearchData
  onUpdate: (data: OppositionResearchData) => void
}

export default function OppositionResearchStep({ data, onUpdate }: OppositionResearchStepProps) {
  const [localData, setLocalData] = useState(data)

  const updateField = (field: keyof OppositionResearchData, value: any) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onUpdate(updated)
  }

  const addOpponent = () => {
    const newOpponent = {
      name: '',
      party: '',
      strengths: [],
      weaknesses: [],
      keyDifferences: []
    }
    updateField('opponents', [...localData.opponents, newOpponent])
  }

  const updateOpponent = (index: number, field: string, value: any) => {
    const updated = [...localData.opponents]
    updated[index] = { ...updated[index], [field]: value }
    updateField('opponents', updated)
  }

  const removeOpponent = (index: number) => {
    updateField('opponents', localData.opponents.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Opponents */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Known Opponents
            </label>
            <p className="text-sm text-gray-500">Add information about your electoral opponents</p>
          </div>
          <button
            type="button"
            onClick={addOpponent}
            className="btn-secondary text-sm inline-flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Add Opponent
          </button>
        </div>

        <div className="space-y-6">
          {localData.opponents.map((opponent, index) => (
            <div key={index} className="card p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opponent Name
                  </label>
                  <input
                    type="text"
                    value={opponent.name}
                    onChange={(e) => updateOpponent(index, 'name', e.target.value)}
                    className="form-input"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Affiliation
                  </label>
                  <select
                    value={opponent.party}
                    onChange={(e) => updateOpponent(index, 'party', e.target.value)}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Their Strengths
                </label>
                <textarea
                  value={opponent.strengths.join('\n')}
                  onChange={(e) => updateOpponent(index, 'strengths', e.target.value.split('\n').filter(s => s.trim()))}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter each strength on a new line (e.g., Well-funded campaign, Name recognition)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Their Weaknesses
                </label>
                <textarea
                  value={opponent.weaknesses.join('\n')}
                  onChange={(e) => updateOpponent(index, 'weaknesses', e.target.value.split('\n').filter(w => w.trim()))}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter each weakness on a new line (e.g., Poor attendance record, Controversial votes)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Policy Differences
                </label>
                <textarea
                  value={opponent.keyDifferences.join('\n')}
                  onChange={(e) => updateOpponent(index, 'keyDifferences', e.target.value.split('\n').filter(d => d.trim()))}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter each difference on a new line (e.g., They oppose healthcare expansion, They voted against education funding)"
                />
              </div>

              <button
                type="button"
                onClick={() => removeOpponent(index)}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <TrashIcon className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}

          {localData.opponents.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>No opponents added yet.</p>
              <p className="text-sm">Click "Add Opponent" to begin opposition research.</p>
            </div>
          )}
        </div>
      </div>

      {/* Own Vulnerabilities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Potential Vulnerabilities
        </label>
        <textarea
          value={localData.vulnerabilities.join('\n')}
          onChange={(e) => updateField('vulnerabilities', e.target.value.split('\n').filter(v => v.trim()))}
          className="form-textarea"
          rows={4}
          placeholder="Enter potential attack points opponents might use, one per line (e.g., Limited political experience, Previous business bankruptcy)"
        />
        <p className="mt-1 text-sm text-gray-500">
          Being honest about vulnerabilities helps prepare effective responses
        </p>
      </div>

      {/* Response Strategies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Response Strategies
        </label>
        <textarea
          value={localData.responseStrategies.join('\n')}
          onChange={(e) => updateField('responseStrategies', e.target.value.split('\n').filter(r => r.trim()))}
          className="form-textarea"
          rows={4}
          placeholder="Enter prepared responses to likely attacks, one per line (e.g., Focus on positive record of community service, Highlight opponent's own voting record)"
        />
        <p className="mt-1 text-sm text-gray-500">
          Prepare responses to anticipated attacks to stay on message
        </p>
      </div>
    </div>
  )
}

