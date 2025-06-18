import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import ActivitySummary from '@/components/dashboard/ActivitySummary'
import { 
  UsersIcon, 
  EnvelopeIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/messages/new">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Message
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Campaigns"
          value={stats.totalCampaigns}
          icon={<UsersIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Total Messages"
          value={stats.totalMessages}
          icon={<EnvelopeIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Draft Messages"
          value={stats.draftMessages}
          icon={<DocumentTextIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Published"
          value={stats.publishedMessages}
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.map(({ campaign, role }) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-500">{campaign.candidateName} • {campaign.office}</p>
                      </div>
                      <Badge variant="default" className="ml-2">
                        {role}
                      </Badge>
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
                <Button variant="primary" asChild>
                  <Link href="/campaigns/new">Create Campaign</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <ActivitySummary activities={recentActivity} />
      </div>
    </div>
  )
}