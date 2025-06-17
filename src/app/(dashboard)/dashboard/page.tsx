import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import ActivitySummary from '@/components/dashboard/ActivitySummary'

async function getDashboardData(userId: string) {
  const [campaigns, recentActivity, messageStats] = await Promise.all([
    prisma.campaignMember.findMany({
      where: { userId },
      include: {
        campaign: {
          include: {
            _count: {
              select: {
                messages: true,
                members: true
              }
            }
          }
        }
      }
    }),
    prisma.activity.findMany({
      where: {
        campaign: {
          members: {
            some: { userId }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: true,
        campaign: true
      }
    }),
    prisma.message.groupBy({
      by: ['status'],
      where: {
        campaign: {
          members: {
            some: { userId }
          }
        }
      },
      _count: true
    })
  ])

  return { campaigns, recentActivity, messageStats }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const { campaigns, recentActivity, messageStats } = await getDashboardData(session.user.id)

  const stats = {
    totalCampaigns: campaigns.length,
    totalMessages: messageStats.reduce((acc, stat) => acc + stat._count, 0),
    draftMessages: messageStats.find(s => s.status === 'DRAFT')?._count || 0,
    publishedMessages: messageStats.find(s => s.status === 'PUBLISHED')?._count || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Total Campaigns</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCampaigns}</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Total Messages</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalMessages}</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Draft Messages</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.draftMessages}</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Published Messages</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.publishedMessages}</dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Campaigns */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Active Campaigns</h2>
          {campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.map(({ campaign, role }) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">{campaign.candidateName} • {campaign.office}</p>
                    </div>
                    <span className="text-xs bg-akashic-primary/10 text-akashic-primary px-2 py-1 rounded">
                      {role}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>{campaign._count.messages} messages</span>
                    <span>{campaign._count.members} members</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No campaigns yet</p>
              <Link href="/campaigns/new" className="btn-primary">
                Create Campaign
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <ActivitySummary activities={recentActivity} />
      </div>
    </div>
  )
}