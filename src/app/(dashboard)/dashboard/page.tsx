import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { 
  MysticalButton, 
  StatCard, 
  AICard,
  MysticalInfoCard,
  MysticalCard 
} from '@/components/ui'
import { 
  Users, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  Plus,
  TrendingUp,
  Target,
  Brain,
  Zap
} from 'lucide-react'
import { CampaignHealthScore } from '@/components/dashboard/CampaignHealthScore'
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed'

async function getDashboardData(userId: string) {
  try {
    const [campaigns, recentActivity, messageStats, voterReach] = await Promise.all([
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
      }).catch(err => {
        console.error('Error fetching campaigns:', err)
        return []
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
      }).catch(err => {
        console.error('Error fetching activities:', err)
        return []
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
      }).catch(err => {
        console.error('Error fetching message stats:', err)
        return []
      }),
      // Mock voter reach data - in real app, calculate from message views/engagement
      Promise.resolve(125000)
    ])

    return { campaigns, recentActivity, messageStats, voterReach }
  } catch (error) {
    console.error('Dashboard data error:', error)
    // Return empty data to allow dashboard to render
    return { 
      campaigns: [], 
      recentActivity: [], 
      messageStats: [], 
      voterReach: 0 
    }
  }
}

function calculateHealthScore(campaigns: any[], messageStats: any[]) {
  // Mock health score calculation
  const baseScore = 75
  const campaignBonus = Math.min(campaigns.length * 5, 15)
  const messageBonus = Math.min(messageStats.reduce((acc, s) => acc + s._count, 0) * 2, 10)
  return Math.min(baseScore + campaignBonus + messageBonus, 100)
}

export default async function DashboardPage() {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Session error:', error)
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Error</h2>
          <p className="text-gray-600">Unable to verify your session. Please try logging in again.</p>
          <MysticalButton asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </MysticalButton>
        </div>
      </div>
    )
  }
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h2>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
          <MysticalButton asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </MysticalButton>
        </div>
      </div>
    )
  }

  const { campaigns, recentActivity, messageStats, voterReach } = await getDashboardData(session.user.id)

  const stats = {
    totalCampaigns: campaigns.length,
    totalMessages: messageStats.reduce((acc, stat) => acc + stat._count, 0),
    draftMessages: messageStats.find(s => s.status === 'DRAFT')?._count || 0,
    publishedMessages: messageStats.find(s => s.status === 'PUBLISHED')?._count || 0,
    voterReach,
    healthScore: calculateHealthScore(campaigns, messageStats)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-black">Campaign Command Center</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {session.user.name || session.user.email}. The oracle awaits your command.
          </p>
        </div>
        <MysticalButton variant="primary" size="lg" asChild>
          <Link href="/messages/new">
            <span className="inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Message
            </span>
          </Link>
        </MysticalButton>
      </div>

      {/* Campaign Health Score - Centerpiece */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CampaignHealthScore 
            score={stats.healthScore}
            breakdown={{
              messageEffectiveness: 85,
              voterEngagement: 72,
              campaignMomentum: 90,
              historicalAlignment: 68
            }}
          />
        </div>
        
        {/* Next Recommended Action */}
        <AICard
          title="Oracle's Guidance"
          description="Recommended next action based on campaign analysis"
          confidence={92}
        >
          <div className="space-y-3">
            <MysticalInfoCard
              icon={Target}
              title="Target Youth Voters"
              content="Historical patterns suggest focusing on college campuses could yield 15% higher engagement"
              action={{
                label: "Create Youth Message",
                onClick: () => window.location.href = '/messages/new?audience=youth'
              }}
            />
          </div>
        </AICard>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Reach"
          value={stats.voterReach.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Message Effectiveness"
          value="82%"
          change="+5.2%"
          trend="up"
          icon={Brain}
        />
        <StatCard
          title="Voter Persuasion Rate"
          value="34%"
          change="+2.1%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Campaigns"
          value={stats.totalCampaigns}
          icon={Zap}
        />
        <StatCard
          title="Total Messages"
          value={stats.totalMessages}
          icon={MessageSquare}
        />
        <StatCard
          title="Historical Pattern Match"
          value="76%"
          change="-1.3%"
          trend="down"
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Active Campaigns */}
        <MysticalCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black">Active Campaigns</h2>
            <Link 
              href="/campaigns" 
              className="text-sm font-medium text-black hover:text-blue-600 transition-colors"
            >
              View all →
            </Link>
          </div>
          
          {campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.slice(0, 3).map(({ campaign, role }) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="block group"
                >
                  <div className="p-4 border border-gray-200 rounded-lg transition-all duration-200 group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-black group-hover:text-blue-600 transition-colors">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {campaign.candidateName} • {campaign.office}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {role}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {campaign._count.messages} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign._count.members} members
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No campaigns yet</p>
              <MysticalButton variant="secondary" asChild>
                <Link href="/campaigns/new">Create Your First Campaign</Link>
              </MysticalButton>
            </div>
          )}
        </MysticalCard>

        {/* Recent Activity Feed */}
        <RecentActivityFeed activities={recentActivity as any} />
      </div>
    </div>
  )
}