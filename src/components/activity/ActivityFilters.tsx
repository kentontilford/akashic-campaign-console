'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FunnelIcon } from '@/lib/icons'

interface Campaign {
  id: string
  name: string
}

interface User {
  id: string
  name?: string | null
  email: string
}

interface ActivityFiltersProps {
  campaigns: Campaign[]
  activityTypes: string[]
  teamMembers: User[]
  currentFilters: {
    campaignId?: string
    type?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
  }
}

export default function ActivityFilters({
  campaigns,
  activityTypes,
  teamMembers,
  currentFilters
}: ActivityFiltersProps) {
  const router = useRouter()
  const [filters, setFilters] = useState(currentFilters)

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (filters.campaignId) params.set('campaignId', filters.campaignId)
    if (filters.type) params.set('type', filters.type)
    if (filters.userId) params.set('userId', filters.userId)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    
    router.push(`/activity?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({})
    router.push('/activity')
  }

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="h-5 w-5 text-gray-400" />
        <h3 className="font-medium text-gray-900">Filters</h3>
      </div>

      <div className="space-y-4">
        {/* Campaign Filter */}
        <div>
          <label htmlFor="campaign" className="label">
            Campaign
          </label>
          <select
            id="campaign"
            className="input"
            value={filters.campaignId || ''}
            onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })}
          >
            <option value="">All campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Type Filter */}
        <div>
          <label htmlFor="type" className="label">
            Activity Type
          </label>
          <select
            id="type"
            className="input"
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All types</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {formatActivityType(type)}
              </option>
            ))}
          </select>
        </div>

        {/* User Filter (only if campaign selected) */}
        {filters.campaignId && teamMembers.length > 0 && (
          <div>
            <label htmlFor="user" className="label">
              Team Member
            </label>
            <select
              id="user"
              className="input"
              value={filters.userId || ''}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            >
              <option value="">All members</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        <div>
          <label className="label">Date Range</label>
          <div className="space-y-2">
            <input
              type="date"
              className="input"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              placeholder="From"
            />
            <input
              type="date"
              className="input"
              value={filters.dateTo || ''}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              placeholder="To"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={applyFilters}
            className="btn-primary flex-1"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="btn-secondary flex-1"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}