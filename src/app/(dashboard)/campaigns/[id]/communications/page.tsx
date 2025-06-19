'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import { 
  EnvelopeIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon
} from '@/lib/icons'
import { DocumentDuplicateIcon, CogIcon } from '@/lib/icons'
import toast from 'react-hot-toast'

interface Communication {
  id: string
  name: string
  type: string
  status: string
  audienceType: string
  audienceCount: number
  subject?: string
  scheduledFor?: string
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  createdAt: string
  createdBy: {
    name?: string
    email: string
  }
  _count: {
    messages: number
  }
}

interface CommunicationStats {
  total: number
  sent: number
  scheduled: number
  draft: number
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  SENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  PAUSED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const TYPE_ICONS = {
  EMAIL: EnvelopeIcon,
  SMS: DevicePhoneMobileIcon,
  ROBOCALL: DevicePhoneMobileIcon,
  DIRECT_MAIL: DocumentDuplicateIcon
}

export default function CommunicationsPage() {
  const params = useParams()
  const campaignId = params.id as string

  const [communications, setCommunications] = useState<Communication[]>([])
  const [stats, setStats] = useState<CommunicationStats>({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchCommunications()
  }, [page, filterStatus, filterType])

  const fetchCommunications = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filterStatus && { status: filterStatus }),
        ...(filterType && { type: filterType })
      })

      const res = await fetch(`/api/campaigns/${campaignId}/communications?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch communications')
      
      const data = await res.json()
      setCommunications(data.communications)
      
      // Calculate stats
      const stats = data.communications.reduce((acc: CommunicationStats, comm: Communication) => {
        acc.total++
        if (comm.status === 'SENT') acc.sent++
        else if (comm.status === 'SCHEDULED') acc.scheduled++
        else if (comm.status === 'DRAFT') acc.draft++
        return acc
      }, { total: 0, sent: 0, scheduled: 0, draft: 0 })
      setStats(stats)
    } catch (error) {
      toast.error('Failed to load communications')
    } finally {
      setLoading(false)
    }
  }

  const filteredCommunications = communications.filter(comm =>
    comm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return CheckCircleIcon
      case 'SCHEDULED': return ClockIcon
      case 'SENDING': return PaperAirplaneIcon
      case 'CANCELLED': case 'FAILED': return XCircleIcon
      case 'PAUSED': return PauseCircleIcon
      default: return DocumentDuplicateIcon
    }
  }

  return (
    <PageLayout
      title="Communication Hub"
      description="Send emails, texts, and more to voters and volunteers"
      actions={
        <div className="flex gap-2">
          <Link
            href={`/campaigns/${campaignId}/templates`}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Templates
          </Link>
          <Link
            href={`/campaigns/${campaignId}/providers`}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            Providers
          </Link>
          <Link
            href={`/campaigns/${campaignId}/communications/new`}
            className="flex items-center px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Campaign
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Campaigns
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sent
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.sent}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Scheduled
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.scheduled}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentDuplicateIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Drafts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.draft}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-akashic-primary focus:border-akashic-primary sm:text-sm"
                  placeholder="Search campaigns..."
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-akashic-primary focus:border-akashic-primary sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="SENDING">Sending</option>
                <option value="SENT">Sent</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-akashic-primary focus:border-akashic-primary sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="ROBOCALL">Robocall</option>
                <option value="DIRECT_MAIL">Direct Mail</option>
              </select>
            </div>
          </div>
        </div>

        {/* Communications List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading communications...</div>
            </div>
          ) : filteredCommunications.length === 0 ? (
            <div className="text-center py-12">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No communications</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
              <div className="mt-6">
                <Link
                  href={`/campaigns/${campaignId}/communications/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-akashic-primary hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Campaign
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredCommunications.map((communication) => {
                const StatusIcon = getStatusIcon(communication.status)
                const TypeIcon = TYPE_ICONS[communication.type as keyof typeof TYPE_ICONS] || EnvelopeIcon
                
                return (
                  <li key={communication.id}>
                    <Link
                      href={`/campaigns/${campaignId}/communications/${communication.id}`}
                      className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <TypeIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {communication.name}
                            </div>
                            {communication.subject && (
                              <div className="text-sm text-gray-500">
                                {communication.subject}
                              </div>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                To: {communication.audienceCount} {communication.audienceType.toLowerCase()}
                              </span>
                              <span className="mx-2">•</span>
                              <span>
                                Created by {communication.createdBy.name || communication.createdBy.email}
                              </span>
                              <span className="mx-2">•</span>
                              <span>
                                {new Date(communication.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex flex-shrink-0">
                          <div className="flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_COLORS[communication.status as keyof typeof STATUS_COLORS]
                            }`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {communication.status}
                            </span>
                            {communication.status === 'SENT' && (
                              <div className="mt-2 text-sm text-gray-500">
                                {communication.deliveredCount > 0 && (
                                  <span>{Math.round((communication.openedCount / communication.deliveredCount) * 100)}% opened</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </PageLayout>
  )
}