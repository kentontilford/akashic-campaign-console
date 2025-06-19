import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Users, MessageSquare, Calendar } from 'lucide-react'
import { MysticalButton, MysticalCard } from '@/components/ui'
import { PageHeader } from '@/components/layout/AppLayout'

async function getCampaigns(userId: string) {
  return prisma.campaignMember.findMany({
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
    },
    orderBy: {
      campaign: {
        createdAt: 'desc'
      }
    }
  })
}

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const campaigns = await getCampaigns(session.user.id)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campaigns"
        description="Command your political campaigns with mystical precision"
        actions={
          <MysticalButton variant="primary" size="lg" asChild>
            <Link href="/campaigns/new">
              <span className="inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                New Campaign
              </span>
            </Link>
          </MysticalButton>
        }
      />

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(({ campaign, role }) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="block group"
            >
              <MysticalCard 
                variant="default" 
                className="h-full transition-all duration-200 group-hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-black group-hover:text-blue-600 transition-colors">
                    {campaign.name}
                  </h3>
                  <span className="text-xs px-3 py-1 bg-black text-white rounded-full">
                    {role}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{campaign.candidateName}</span>
                  <span className="mx-2">•</span>
                  {campaign.office}
                </p>
                
                {campaign.district && (
                  <p className="text-sm text-gray-500 mb-4">
                    District: {campaign.district}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4" />
                    <span>{campaign._count.messages} messages</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{campaign._count.members} members</span>
                  </div>
                </div>
                
                {campaign.electionDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <Calendar className="h-4 w-4" />
                    <span>Election: {new Date(campaign.electionDate).toLocaleDateString()}</span>
                  </div>
                )}
              </MysticalCard>
            </Link>
          ))}
        </div>
      ) : (
        <MysticalCard className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-3">No campaigns yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Begin your political journey by creating your first campaign. The oracle awaits your command.
          </p>
          <MysticalButton variant="primary" size="lg" asChild>
            <Link href="/campaigns/new">
              <span className="inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Campaign
              </span>
            </Link>
          </MysticalButton>
        </MysticalCard>
      )}
    </div>
  )
}