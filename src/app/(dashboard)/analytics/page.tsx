import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'

async function getAnalyticsData(userId: string) {
  // Get all campaigns user has access to
  const campaigns = await prisma.campaignMember.findMany({
    where: { userId },
    select: { campaignId: true }
  })
  
  const campaignIds = campaigns.map(c => c.campaignId)

  // Get message stats
  const messageStats = await prisma.message.groupBy({
    by: ['status', 'platform'],
    where: {
      campaignId: { in: campaignIds }
    },
    _count: true
  })

  // Get messages over time (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const messagesOverTime = await prisma.message.findMany({
    where: {
      campaignId: { in: campaignIds },
      createdAt: { gte: thirtyDaysAgo }
    },
    select: {
      createdAt: true,
      status: true
    }
  })

  // Get approval metrics
  const approvalMetrics = await prisma.approval.groupBy({
    by: ['status'],
    where: {
      message: {
        campaignId: { in: campaignIds }
      }
    },
    _count: true
  })

  // Get platform distribution
  const platformDistribution = await prisma.message.groupBy({
    by: ['platform'],
    where: {
      campaignId: { in: campaignIds }
    },
    _count: true
  })

  return {
    messageStats,
    messagesOverTime,
    approvalMetrics,
    platformDistribution
  }
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const {
    messageStats,
    messagesOverTime,
    approvalMetrics,
    platformDistribution
  } = await getAnalyticsData(session.user.id)

  // Process data for charts
  const statusData = Object.values(
    messageStats.reduce((acc, stat) => {
      if (!acc[stat.status]) {
        acc[stat.status] = { status: stat.status, count: 0 }
      }
      acc[stat.status].count += stat._count
      return acc
    }, {} as Record<string, { status: string; count: number }>)
  )

  const platformData = platformDistribution.map(p => ({
    name: p.platform,
    value: p._count
  }))

  const approvalData = approvalMetrics.map(a => ({
    name: a.status.replace(/_/g, ' '),
    value: a._count
  }))

  // Process messages over time
  const messagesByDate = messagesOverTime.reduce((acc, message) => {
    const date = new Date(message.createdAt).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { date, created: 0, approved: 0, published: 0 }
    }
    acc[date].created++
    if (message.status === 'APPROVED') acc[date].approved++
    if (message.status === 'PUBLISHED') acc[date].published++
    return acc
  }, {} as Record<string, { date: string; created: number; approved: number; published: number }>)

  const timelineData = Object.values(messagesByDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your campaign performance and messaging effectiveness
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Total Messages</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {messageStats.reduce((sum, stat) => sum + stat._count, 0)}
          </dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Published</dt>
          <dd className="mt-1 text-3xl font-semibold text-akashic-accent">
            {statusData.find(s => s.status === 'PUBLISHED')?.count || 0}
          </dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Pending Approval</dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">
            {statusData.find(s => s.status === 'PENDING_APPROVAL')?.count || 0}
          </dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Approval Rate</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {approvalMetrics.length > 0 
              ? Math.round((approvalData.find(a => a.name === 'APPROVED')?.value || 0) / 
                  approvalMetrics.reduce((sum, a) => sum + a._count, 0) * 100)
              : 0}%
          </dd>
        </div>
      </div>

      <AnalyticsCharts
        statusData={statusData}
        platformData={platformData}
        approvalData={approvalData}
        timelineData={timelineData}
      />
    </div>
  )
}