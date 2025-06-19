import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Filter, MessageSquare, Sparkles } from 'lucide-react'
import { MysticalButton, MysticalCard, StatCard } from '@/components/ui'
import { PageHeader } from '@/components/layout/AppLayout'
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

const statusConfig = {
  DRAFT: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    description: 'Work in progress'
  },
  PENDING_APPROVAL: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    description: 'Awaiting approval'
  },
  APPROVED: { 
    label: 'Approved', 
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Ready to publish'
  },
  REJECTED: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-700 border-red-300',
    description: 'Needs revision'
  },
  CHANGES_REQUESTED: { 
    label: 'Changes', 
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    description: 'Revisions requested'
  },
  SCHEDULED: { 
    label: 'Scheduled', 
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: 'Set to publish'
  },
  PUBLISHED: { 
    label: 'Published', 
    color: 'bg-green-100 text-green-700 border-green-300',
    description: 'Live'
  },
  ARCHIVED: { 
    label: 'Archived', 
    color: 'bg-gray-100 text-gray-500 border-gray-300',
    description: 'Stored'
  }
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

  const totalMessages = messages.length
  const draftCount = statusCounts.DRAFT || 0
  const pendingCount = statusCounts.PENDING_APPROVAL || 0
  const publishedCount = statusCounts.PUBLISHED || 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Message Generator"
        description="Craft mystical messages that resonate across all audiences"
        actions={
          <div className="flex items-center gap-3">
            <MysticalButton variant="secondary" size="md">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </MysticalButton>
            <MysticalButton variant="primary" size="lg" asChild>
              <Link href={`/messages/new${searchParams.campaignId ? `?campaignId=${searchParams.campaignId}` : ''}`}>
                <span className="inline-flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Message
                </span>
              </Link>
            </MysticalButton>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={totalMessages}
          icon={MessageSquare}
        />
        <StatCard
          title="Drafts"
          value={draftCount}
          change={draftCount > 0 ? 'Active' : undefined}
          trend={draftCount > 0 ? 'neutral' : undefined}
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          change={pendingCount > 0 ? 'Awaiting' : undefined}
          trend={pendingCount > 0 ? 'neutral' : undefined}
        />
        <StatCard
          title="Published"
          value={publishedCount}
          change={publishedCount > 0 ? 'Live' : undefined}
          trend={publishedCount > 0 ? 'up' : undefined}
        />
      </div>

      {/* Status Overview */}
      {Object.keys(statusCounts).length > 0 && (
        <MysticalCard>
          <h3 className="text-lg font-semibold text-black mb-4">Status Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = statusCounts[status as keyof typeof statusCounts] || 0
              if (count === 0) return null
              
              return (
                <div key={status} className="text-center">
                  <div className={`inline-flex items-center justify-center w-full px-3 py-2 rounded-lg border ${config.color}`}>
                    <span className="text-2xl font-bold mr-2">{count}</span>
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                </div>
              )
            })}
          </div>
        </MysticalCard>
      )}

      {/* Messages List */}
      {messages.length > 0 ? (
        <MessagesList messages={messages} />
      ) : (
        <MysticalCard className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-3">No messages yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Begin channeling the oracle's wisdom to create powerful campaign messages.
          </p>
          <MysticalButton variant="primary" size="lg" asChild>
            <Link href="/messages/new">
              <span className="inline-flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Your First Message
              </span>
            </Link>
          </MysticalButton>
        </MysticalCard>
      )}
    </div>
  )
}