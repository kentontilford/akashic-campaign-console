import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import MessagesList from '@/components/messaging/MessagesList'

async function getMessages(userId: string, campaignId?: string) {
  const whereClause: any = {
    campaign: {
      members: {
        some: { userId }
      }
    }
  }

  if (campaignId) {
    whereClause.campaignId = campaignId
  }

  return prisma.message.findMany({
    where: whereClause,
    include: {
      campaign: true,
      author: true,
      _count: {
        select: {
          versions: true,
          approvals: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500'
}

const platformIcons = {
  EMAIL: '✉️',
  FACEBOOK: '📘',
  TWITTER: '🐦',
  INSTAGRAM: '📷',
  PRESS_RELEASE: '📰',
  WEBSITE: '🌐',
  SMS: '💬'
}

export default async function MessagesPage({
  searchParams
}: {
  searchParams: { campaignId?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const messages = await getMessages(session.user.id, searchParams.campaignId)

  // Group messages by status for summary
  const statusCounts = messages.reduce((acc, message) => {
    acc[message.status] = (acc[message.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage your campaign messages across all platforms
          </p>
        </div>
        <Link
          href={`/messages/new${searchParams.campaignId ? `?campaignId=${searchParams.campaignId}` : ''}`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Message
        </Link>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="card text-center p-3">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
              {status.replace(/_/g, ' ')}
            </span>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      {/* Messages List */}
      <MessagesList messages={messages} />
    </div>
  )
}