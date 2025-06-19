'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@/lib/icons'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Volunteer {
  id: string
  firstName: string
  lastName: string
  preferredName: string | null
  email: string
  phone: string
  phoneType: string | null
  city: string
  state: string
  status: string
  skills: string[]
  joinDate: string
  _count: {
    shifts: number
    activities: number
  }
  totalHours?: number
  lastActive?: string
}

interface VolunteerStats {
  total: number
  active: number
  new30Days: number
  totalHours: number
  topSkills: { skill: string; count: number }[]
}

const SKILL_OPTIONS = [
  'CANVASSING',
  'PHONE_BANKING',
  'DATA_ENTRY',
  'EVENT_SUPPORT',
  'SOCIAL_MEDIA',
  'FUNDRAISING',
  'VOLUNTEER_COORDINATOR',
  'DRIVER',
  'SPANISH_SPEAKER',
  'TECH_SUPPORT'
]

export default function VolunteersPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [stats, setStats] = useState<VolunteerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    skill: '',
    hasUpcomingShift: false
  })
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])

  useEffect(() => {
    fetchVolunteers()
  }, [search, filters])

  const fetchVolunteers = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        search,
        ...(filters.status && { status: filters.status }),
        ...(filters.skill && { skill: filters.skill }),
        ...(filters.hasUpcomingShift && { hasUpcomingShift: 'true' })
      })

      const res = await fetch(`/api/campaigns/${campaignId}/volunteers?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch volunteers')

      const data = await res.json()
      setVolunteers(data.volunteers)
      setStats(data.stats)
    } catch (error) {
      toast.error('Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedVolunteers.length === 0) {
      toast.error('Please select volunteers first')
      return
    }

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/volunteers/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerIds: selectedVolunteers,
          action
        })
      })

      if (!res.ok) throw new Error('Bulk action failed')
      
      toast.success(`${action} completed for ${selectedVolunteers.length} volunteers`)
      setSelectedVolunteers([])
      fetchVolunteers()
    } catch (error) {
      toast.error('Failed to complete bulk action')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'BLACKLISTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <PageLayout
      title="Volunteer Management"
      description="Recruit, organize, and manage campaign volunteers"
      actions={
        <div className="flex gap-2">
          <Link
            href={`/campaigns/${campaignId}/volunteers/recruit`}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Recruit
          </Link>
          <Link
            href={`/campaigns/${campaignId}/events`}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Events
          </Link>
          <Link
            href={`/campaigns/${campaignId}/volunteers/new`}
            className="flex items-center px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Volunteer
          </Link>
        </div>
      }
    >
      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Volunteers</div>
                <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              </div>
              <UserGroupIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
              </div>
              <CheckBadgeIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">New (30 days)</div>
                <div className="text-2xl font-bold text-blue-600">{stats.new30Days}</div>
              </div>
              <PlusIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Hours</div>
                <div className="text-2xl font-bold">{stats.totalHours.toLocaleString()}</div>
              </div>
              <ClockIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Top Skills */}
      {stats && stats.topSkills.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top Volunteer Skills</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map(({ skill, count }) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {skill.replace('_', ' ')} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
            <select
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Skills</option>
              {SKILL_OPTIONS.map(skill => (
                <option key={skill} value={skill}>
                  {skill.replace('_', ' ')}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilters({ ...filters, hasUpcomingShift: !filters.hasUpcomingShift })}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filters.hasUpcomingShift
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVolunteers.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedVolunteers.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('send-message')}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Message
            </button>
            <button
              onClick={() => handleBulkAction('assign-shift')}
              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Assign to Shift
            </button>
            <button
              onClick={() => handleBulkAction('export')}
              className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Export
            </button>
            <button
              onClick={() => setSelectedVolunteers([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading volunteers...</div>
        ) : volunteers.length === 0 ? (
          <div className="p-8 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No volunteers found</p>
            <Link
              href={`/campaigns/${campaignId}/volunteers/new`}
              className="inline-flex items-center px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add First Volunteer
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedVolunteers.length === volunteers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVolunteers(volunteers.map(v => v.id))
                      } else {
                        setSelectedVolunteers([])
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volunteers.map((volunteer) => (
                <tr
                  key={volunteer.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedVolunteers.includes(volunteer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVolunteers([...selectedVolunteers, volunteer.id])
                        } else {
                          setSelectedVolunteers(selectedVolunteers.filter(id => id !== volunteer.id))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/campaigns/${campaignId}/volunteers/${volunteer.id}`}
                      className="hover:text-akashic-primary"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {volunteer.preferredName || volunteer.firstName} {volunteer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(volunteer.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {volunteer.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {volunteer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                        >
                          {skill.replace('_', ' ')}
                        </span>
                      ))}
                      {volunteer.skills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{volunteer.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {volunteer._count.shifts} shifts
                      </div>
                      <div className="text-gray-500">
                        {volunteer.totalHours || 0} hours total
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      getStatusColor(volunteer.status)
                    }`}>
                      {volunteer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/campaigns/${campaignId}/volunteers/${volunteer.id}`}
                        className="text-akashic-primary hover:text-blue-700"
                      >
                        View
                      </Link>
                      <Link
                        href={`/campaigns/${campaignId}/volunteers/${volunteer.id}/shifts`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Shifts
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageLayout>
  )
}