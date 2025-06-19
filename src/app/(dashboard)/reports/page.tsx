import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PageHeader } from '@/components/layout/AppLayout'
import { MysticalCard, MysticalButton, AICard } from '@/components/ui'
import { FileText, Download, Calendar, TrendingUp, Users, MessageSquare, Target, BarChart3 } from 'lucide-react'

const reportTypes = [
  {
    id: 'campaign-performance',
    title: 'Campaign Performance Report',
    description: 'Comprehensive analysis of campaign metrics and KPIs',
    icon: TrendingUp,
    lastGenerated: '2 days ago',
    frequency: 'Weekly'
  },
  {
    id: 'voter-engagement',
    title: 'Voter Engagement Analysis',
    description: 'Detailed breakdown of voter interactions and response rates',
    icon: Users,
    lastGenerated: '5 days ago',
    frequency: 'Bi-weekly'
  },
  {
    id: 'message-effectiveness',
    title: 'Message Effectiveness Report',
    description: 'Performance metrics for all campaign messages',
    icon: MessageSquare,
    lastGenerated: '1 week ago',
    frequency: 'Monthly'
  },
  {
    id: 'audience-insights',
    title: 'Audience Insights Report',
    description: 'Demographics and behavioral analysis of your voter base',
    icon: Target,
    lastGenerated: '3 days ago',
    frequency: 'Monthly'
  },
  {
    id: 'historical-comparison',
    title: 'Historical Comparison Analysis',
    description: 'Compare current performance with historical election data',
    icon: BarChart3,
    lastGenerated: '2 weeks ago',
    frequency: 'Quarterly'
  }
]

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Divine insights crystallized into actionable intelligence"
        actions={
          <MysticalButton variant="primary" size="lg">
            <FileText className="h-5 w-5 mr-2" />
            Generate Custom Report
          </MysticalButton>
        }
      />

      {/* AI Insights */}
      <AICard
        title="Report Intelligence"
        description="The oracle's guidance on your campaign data"
        confidence={94}
      >
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-black mb-2">Key Insight</h4>
          <p className="text-sm text-gray-700">
            Your message engagement rate has increased by 23% over the past month. 
            The oracle suggests generating a detailed Message Effectiveness Report to 
            identify which content themes are resonating most with your audience.
          </p>
        </div>
      </AICard>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          
          return (
            <MysticalCard key={report.id} className="hover:scale-[1.01] transition-transform">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black text-white rounded-lg">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Last Generated</p>
                      <p className="text-sm font-medium text-black">{report.lastGenerated}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Frequency</p>
                      <p className="text-sm font-medium text-black">{report.frequency}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MysticalButton variant="primary" size="sm">
                      Generate Now
                    </MysticalButton>
                    <MysticalButton variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download Last
                    </MysticalButton>
                  </div>
                </div>
              </div>
            </MysticalCard>
          )
        })}
      </div>

      {/* Recent Reports */}
      <MysticalCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-black">Recent Reports</h3>
          <MysticalButton variant="ghost" size="sm">
            View All
          </MysticalButton>
        </div>
        
        <div className="space-y-3">
          {[
            { 
              name: 'Weekly Performance Report - Week 47', 
              date: '2 days ago', 
              size: '2.4 MB',
              type: 'Performance'
            },
            { 
              name: 'Voter Engagement Analysis - November', 
              date: '5 days ago', 
              size: '1.8 MB',
              type: 'Engagement'
            },
            { 
              name: 'Message Effectiveness - Q4 Summary', 
              date: '1 week ago', 
              size: '3.1 MB',
              type: 'Messages'
            },
            { 
              name: 'Audience Demographics Report', 
              date: '10 days ago', 
              size: '1.2 MB',
              type: 'Demographics'
            }
          ].map((report, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-black">{report.name}</p>
                  <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {report.type}
                </span>
                <MysticalButton variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </MysticalButton>
              </div>
            </div>
          ))}
        </div>
      </MysticalCard>

      {/* Schedule Reports */}
      <MysticalCard className="bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-black">Scheduled Reports</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Set up automated reports to receive regular insights from the oracle.
        </p>
        <MysticalButton variant="secondary">
          Configure Report Schedule
        </MysticalButton>
      </MysticalCard>
    </div>
  )
}