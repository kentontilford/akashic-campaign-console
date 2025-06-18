'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface PolicyPositionsData {
  topPriorities: {
    issue: string
    position: string
    keyPoints: string[]
  }[]
  economicPolicy: {
    taxation: string
    spending: string
    jobCreation: string
    businessRegulation: string
  }
  socialPolicy: {
    healthcare: string
    education: string
    socialSecurity: string
    immigration: string
    gunControl: string
    abortion: string
    lgbtqRights: string
  }
  environmentalPolicy: {
    climateChange: string
    energyPolicy: string
    conservation: string
  }
  foreignPolicy: {
    defense: string
    trade: string
    alliances: string
  }
}

interface PolicyPositionsStepProps {
  data: PolicyPositionsData
  onUpdate: (data: PolicyPositionsData) => void
}

export default function PolicyPositionsStep({ data, onUpdate }: PolicyPositionsStepProps) {
  const [localData, setLocalData] = useState(data)
  const [activeTab, setActiveTab] = useState<'priorities' | 'economic' | 'social' | 'environmental' | 'foreign'>('priorities')

  const updateField = (field: keyof PolicyPositionsData, value: any) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onUpdate(updated)
  }

  const addPriority = () => {
    const newPriority = {
      issue: '',
      position: '',
      keyPoints: []
    }
    updateField('topPriorities', [...localData.topPriorities, newPriority])
  }

  const updatePriority = (index: number, field: string, value: any) => {
    const updated = [...localData.topPriorities]
    updated[index] = { ...updated[index], [field]: value }
    updateField('topPriorities', updated)
  }

  const removePriority = (index: number) => {
    updateField('topPriorities', localData.topPriorities.filter((_, i) => i !== index))
  }

  const updatePolicyArea = (area: 'economicPolicy' | 'socialPolicy' | 'environmentalPolicy' | 'foreignPolicy', field: string, value: string) => {
    const updated = { ...localData[area], [field]: value }
    updateField(area, updated)
  }

  const tabs = [
    { id: 'priorities', label: 'Top Priorities' },
    { id: 'economic', label: 'Economic' },
    { id: 'social', label: 'Social' },
    { id: 'environmental', label: 'Environmental' },
    { id: 'foreign', label: 'Foreign Policy' }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-akashic-primary text-akashic-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'priorities' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Top Policy Priorities</h3>
              <p className="text-sm text-gray-500">List your 3-5 most important policy issues</p>
            </div>
            <button
              type="button"
              onClick={addPriority}
              className="btn-secondary text-sm inline-flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              Add Priority
            </button>
          </div>

          <div className="space-y-4">
            {localData.topPriorities.map((priority, index) => (
              <div key={index} className="card p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Issue
                  </label>
                  <input
                    type="text"
                    value={priority.issue}
                    onChange={(e) => updatePriority(index, 'issue', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Healthcare Reform, Education Funding"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Position
                  </label>
                  <textarea
                    value={priority.position}
                    onChange={(e) => updatePriority(index, 'position', e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe your stance on this issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Points
                  </label>
                  <textarea
                    value={priority.keyPoints.join('\n')}
                    onChange={(e) => updatePriority(index, 'keyPoints', e.target.value.split('\n').filter(p => p.trim()))}
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter each key point on a new line"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removePriority(index)}
                  className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
                >
                  <TrashIcon className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'economic' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Economic Policy Positions</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxation
            </label>
            <textarea
              value={localData.economicPolicy.taxation}
              onChange={(e) => updatePolicyArea('economicPolicy', 'taxation', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on tax policy, rates, and reform..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Government Spending
            </label>
            <textarea
              value={localData.economicPolicy.spending}
              onChange={(e) => updatePolicyArea('economicPolicy', 'spending', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your approach to budgets, debt, and spending priorities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Creation
            </label>
            <textarea
              value={localData.economicPolicy.jobCreation}
              onChange={(e) => updatePolicyArea('economicPolicy', 'jobCreation', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your plans for employment and workforce development..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Regulation
            </label>
            <textarea
              value={localData.economicPolicy.businessRegulation}
              onChange={(e) => updatePolicyArea('economicPolicy', 'businessRegulation', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on regulations, small business support, etc..."
            />
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Social Policy Positions</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Healthcare
            </label>
            <textarea
              value={localData.socialPolicy.healthcare}
              onChange={(e) => updatePolicyArea('socialPolicy', 'healthcare', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your healthcare policy positions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education
            </label>
            <textarea
              value={localData.socialPolicy.education}
              onChange={(e) => updatePolicyArea('socialPolicy', 'education', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your education policy positions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Security
            </label>
            <textarea
              value={localData.socialPolicy.socialSecurity}
              onChange={(e) => updatePolicyArea('socialPolicy', 'socialSecurity', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on Social Security and retirement security..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immigration
            </label>
            <textarea
              value={localData.socialPolicy.immigration}
              onChange={(e) => updatePolicyArea('socialPolicy', 'immigration', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your immigration policy positions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gun Policy
            </label>
            <textarea
              value={localData.socialPolicy.gunControl}
              onChange={(e) => updatePolicyArea('socialPolicy', 'gunControl', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on gun rights and regulations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reproductive Rights
            </label>
            <textarea
              value={localData.socialPolicy.abortion}
              onChange={(e) => updatePolicyArea('socialPolicy', 'abortion', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your position on reproductive rights..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LGBTQ+ Rights
            </label>
            <textarea
              value={localData.socialPolicy.lgbtqRights}
              onChange={(e) => updatePolicyArea('socialPolicy', 'lgbtqRights', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on LGBTQ+ rights and equality..."
            />
          </div>
        </div>
      )}

      {activeTab === 'environmental' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Environmental Policy Positions</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Climate Change
            </label>
            <textarea
              value={localData.environmentalPolicy.climateChange}
              onChange={(e) => updatePolicyArea('environmentalPolicy', 'climateChange', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on climate change and carbon reduction..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Policy
            </label>
            <textarea
              value={localData.environmentalPolicy.energyPolicy}
              onChange={(e) => updatePolicyArea('environmentalPolicy', 'energyPolicy', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your approach to renewable energy, fossil fuels, etc..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conservation
            </label>
            <textarea
              value={localData.environmentalPolicy.conservation}
              onChange={(e) => updatePolicyArea('environmentalPolicy', 'conservation', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on land conservation, wildlife protection, etc..."
            />
          </div>
        </div>
      )}

      {activeTab === 'foreign' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Foreign Policy Positions</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Defense & Military
            </label>
            <textarea
              value={localData.foreignPolicy.defense}
              onChange={(e) => updatePolicyArea('foreignPolicy', 'defense', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on defense spending, military engagement, etc..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trade Policy
            </label>
            <textarea
              value={localData.foreignPolicy.trade}
              onChange={(e) => updatePolicyArea('foreignPolicy', 'trade', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your approach to international trade, tariffs, agreements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              International Alliances
            </label>
            <textarea
              value={localData.foreignPolicy.alliances}
              onChange={(e) => updatePolicyArea('foreignPolicy', 'alliances', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Your stance on NATO, UN, and other international organizations..."
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PolicyPositionsStep