import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PageHeader } from '@/components/layout/AppLayout'
import { MysticalCard, AICard, StatCard, MysticalButton } from '@/components/ui'
import { Users, Target, TrendingUp, Database, Search, FileUp } from 'lucide-react'
import Link from 'next/link'

export default async function VotersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  // Mock data - in real app, fetch from database
  const voterStats = {
    totalVoters: 125847,
    identifiedSupporters: 45231,
    undecided: 67892,
    targetedThisWeek: 8724,
    conversionRate: 34.2,
    averageScore: 72
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Voter Analysis"
        description="Divine insights into your voter universe"
        actions={
          <div className="flex items-center gap-3">
            <MysticalButton variant="secondary" size="md">
              <FileUp className="h-4 w-4 mr-2" />
              Import Voters
            </MysticalButton>
            <MysticalButton variant="primary" size="lg">
              <Search className="h-4 w-4 mr-2" />
              Search Voters
            </MysticalButton>
          </div>
        }
      />

      {/* AI Oracle Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AICard
            title="Oracle's Voter Insights"
            description="Strategic guidance based on voter behavior patterns"
            confidence={91}
          >
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-black mb-2">Key Finding</h4>
                <p className="text-sm text-gray-700">
                  Historical patterns suggest focusing on suburban women aged 35-54 could yield a 
                  12% higher conversion rate. This demographic showed similar voting patterns in 
                  the 2018 midterms.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">78%</div>
                  <p className="text-xs text-gray-600">Match with 2020 patterns</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">+15%</div>
                  <p className="text-xs text-gray-600">Projected turnout increase</p>
                </div>
              </div>
            </div>
          </AICard>
        </div>
        
        <MysticalCard>
          <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/campaigns/1/voters" className="block">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">View Voter List</span>
                  <span className="text-xs text-gray-500">→</span>
                </div>
              </div>
            </Link>
            <Link href="/campaigns/1/voters/import" className="block">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Import Voter File</span>
                  <span className="text-xs text-gray-500">→</span>
                </div>
              </div>
            </Link>
            <Link href="/campaigns/1/voters/segments" className="block">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Create Segments</span>
                  <span className="text-xs text-gray-500">→</span>
                </div>
              </div>
            </Link>
          </div>
        </MysticalCard>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Voters"
          value={voterStats.totalVoters.toLocaleString()}
          icon={Database}
        />
        <StatCard
          title="Identified Supporters"
          value={voterStats.identifiedSupporters.toLocaleString()}
          change="+2,341 this week"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Undecided Voters"
          value={voterStats.undecided.toLocaleString()}
          icon={Target}
        />
        <StatCard
          title="Targeted This Week"
          value={voterStats.targetedThisWeek.toLocaleString()}
          change="+18%"
          trend="up"
          icon={Target}
        />
        <StatCard
          title="Conversion Rate"
          value={`${voterStats.conversionRate}%`}
          change="+2.1%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Average Score"
          value={voterStats.averageScore}
          change="Stable"
          trend="neutral"
          icon={Target}
        />
      </div>

      {/* Voter Segments */}
      <MysticalCard>
        <h3 className="text-xl font-semibold text-black mb-6">Voter Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Strong Supporters', count: 23451, percentage: 18.6, color: 'bg-green-500' },
            { name: 'Lean Support', count: 21780, percentage: 17.3, color: 'bg-green-300' },
            { name: 'Undecided', count: 67892, percentage: 53.9, color: 'bg-gray-300' },
            { name: 'Lean Opposition', count: 8934, percentage: 7.1, color: 'bg-red-300' },
            { name: 'Strong Opposition', count: 3790, percentage: 3.0, color: 'bg-red-500' },
          ].map((segment) => (
            <div key={segment.name} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-black">{segment.name}</h4>
                <span className="text-sm text-gray-600">{segment.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${segment.color}`}
                  style={{ width: `${segment.percentage}%` }}
                />
              </div>
              <p className="text-2xl font-bold text-black">{segment.count.toLocaleString()}</p>
              <p className="text-xs text-gray-500">voters</p>
            </div>
          ))}
        </div>
      </MysticalCard>

      {/* Historical Patterns */}
      <MysticalCard className="bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-black">Historical Voting Patterns</h3>
          <Link href="/elections" className="text-sm font-medium text-black hover:text-blue-600">
            View full analysis →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">82%</div>
            <p className="text-sm text-gray-600">Match with 2020 turnout</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">+5.2%</div>
            <p className="text-sm text-gray-600">Swing from last election</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">67%</div>
            <p className="text-sm text-gray-600">Historical accuracy</p>
          </div>
        </div>
      </MysticalCard>
    </div>
  )
}