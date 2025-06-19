'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TagIcon,
  ArrowUpTrayIcon,
  FunnelIcon
} from '@/lib/icons'
import toast from 'react-hot-toast'

interface Voter {
  id: string
  firstName: string
  lastName: string
  resCity: string
  resState: string
  phone: string | null
  email: string | null
  partyAffiliation: string | null
  supportLevel: string | null
  age: number | null
  tags: { tag: string }[]
  contactHistory: {
    contactType: string
    contactDate: string
    result: string
  }[]
}

interface VoterStats {
  total: number
  support: Record<string, number>
  withPhone: number
  withEmail: number
}

export default function VotersPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [voters, setVoters] = useState<Voter[]>([])
  const [stats, setStats] = useState<VoterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    city: '',
    party: '',
    supportLevel: '',
    hasPhone: false,
    hasEmail: false
  })
  const [showImport, setShowImport] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchVoters()
  }, [page, search, filters])

  const fetchVoters = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        ...(filters.city && { city: filters.city }),
        ...(filters.party && { party: filters.party }),
        ...(filters.supportLevel && { supportLevel: filters.supportLevel }),
        ...(filters.hasPhone && { hasPhone: 'true' }),
        ...(filters.hasEmail && { hasEmail: 'true' })
      })

      const res = await fetch(`/api/campaigns/${campaignId}/voters?${params}`)
      if (!res.ok) throw new Error('Failed to fetch voters')

      const data = await res.json()
      setVoters(data.voters)
      setStats(data.stats)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      toast.error('Failed to load voters')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dataSource', 'STATE_FILE')

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/voters/import`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Import failed')

      const result = await res.json()
      toast.success(`Imported ${result.successCount} voters successfully`)
      
      if (result.errorCount > 0) {
        toast.error(`${result.errorCount} records failed to import`)
      }

      setShowImport(false)
      fetchVoters()
    } catch (error) {
      toast.error('Failed to import voters')
    }
  }

  const supportColors = {
    STRONG_SUPPORT: 'bg-green-100 text-green-800',
    LEAN_SUPPORT: 'bg-green-50 text-green-700',
    UNDECIDED: 'bg-gray-100 text-gray-800',
    LEAN_OPPOSE: 'bg-red-50 text-red-700',
    STRONG_OPPOSE: 'bg-red-100 text-red-800'
  }

  return (
    <PageLayout
      title="Voter CRM"
      description="Manage and track voter outreach"
      actions={
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
          Import Voters
        </button>
      }
    >
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Voters</div>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Supporters</div>
            <div className="text-2xl font-bold text-green-600">
              {((stats.support.STRONG_SUPPORT || 0) + (stats.support.LEAN_SUPPORT || 0)).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">With Phone</div>
            <div className="text-2xl font-bold">{stats.withPhone.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">With Email</div>
            <div className="text-2xl font-bold">{stats.withEmail.toLocaleString()}</div>
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
              value={filters.supportLevel}
              onChange={(e) => setFilters({ ...filters, supportLevel: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Support Levels</option>
              <option value="STRONG_SUPPORT">Strong Support</option>
              <option value="LEAN_SUPPORT">Lean Support</option>
              <option value="UNDECIDED">Undecided</option>
              <option value="LEAN_OPPOSE">Lean Oppose</option>
              <option value="STRONG_OPPOSE">Strong Oppose</option>
            </select>
            <select
              value={filters.party}
              onChange={(e) => setFilters({ ...filters, party: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Parties</option>
              <option value="DEM">Democrat</option>
              <option value="REP">Republican</option>
              <option value="IND">Independent</option>
              <option value="GRN">Green</option>
              <option value="LIB">Libertarian</option>
            </select>
            <button
              onClick={() => setFilters({ ...filters, hasPhone: !filters.hasPhone })}
              className={`px-4 py-2 rounded-lg border ${
                filters.hasPhone 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-300'
              }`}
            >
              <PhoneIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setFilters({ ...filters, hasEmail: !filters.hasEmail })}
              className={`px-4 py-2 rounded-lg border ${
                filters.hasEmail 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-300'
              }`}
            >
              <EnvelopeIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Voters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading voters...</div>
        ) : voters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No voters found. Import a voter file to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Support
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voters.map((voter) => (
                <tr
                  key={voter.id}
                  onClick={() => router.push(`/campaigns/${campaignId}/voters/${voter.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {voter.firstName} {voter.lastName}
                      </div>
                      {voter.age && (
                        <div className="text-sm text-gray-500">Age {voter.age}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {voter.resCity}, {voter.resState}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {voter.phone && <PhoneIcon className="h-4 w-4 text-gray-400" />}
                      {voter.email && <EnvelopeIcon className="h-4 w-4 text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {voter.partyAffiliation || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voter.supportLevel && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        supportColors[voter.supportLevel as keyof typeof supportColors]
                      }`}>
                        {voter.supportLevel.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {voter.contactHistory.length > 0
                      ? `${voter.contactHistory[0].contactType} - ${voter.contactHistory[0].result}`
                      : 'Never contacted'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Import Voter File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with voter data. The file should include columns for:
              state_voter_id, first_name, last_name, address, city, state, zip, and registration_status.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
              }}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}