import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ActivityFeed from '@/components/activity/ActivityFeed'
import ActivityFilters from '@/components/activity/ActivityFilters'

async function getActivities(
  userId: string,
  filters: {
    campaignId?: string
    type?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
  }
) {
  // Get user's campaigns
  const campaigns = await prisma.campaignMember.findMany({
    where: { userId },
    select: { campaignId: true, campaign: true }
  })
  
  const campaignIds = campaigns.map(c => c.campaignId)

  // Build where clause
  const where: any = {
    campaignId: { in: campaignIds }
  }

  if (filters.campaignId) {
    where.campaignId = filters.campaignId
  }

  if (filters.type) {
    where.type = filters.type
  }

  if (filters.userId) {
    where.userId = filters.userId
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      where.createdAt.lte = new Date(filters.dateTo)
    }
  }

  // Get activities
  const activities = await prisma.activity.findMany({
    where,
    include: {
      user: true,
      campaign: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Limit to last 100 activities
  })

  return { activities, campaigns: campaigns.map(c => c.campaign) }
}

export default async function ActivityPage({
  searchParams
}: {
  searchParams: {
    campaignId?: string
    type?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
  }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const { activities, campaigns } = await getActivities(session.user.id, searchParams)

  // Get unique activity types from the activities
  const activityTypes = Array.from(new Set(activities.map(a => a.type))).sort()

  // Get team members for user filter
  const teamMembers = searchParams.campaignId
    ? await prisma.campaignMember.findMany({
        where: { campaignId: searchParams.campaignId },
        include: { user: true }
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track all actions and changes across your campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <ActivityFilters
            campaigns={campaigns}
            activityTypes={activityTypes}
            teamMembers={teamMembers.map(m => m.user)}
            currentFilters={searchParams}
          />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-3">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}