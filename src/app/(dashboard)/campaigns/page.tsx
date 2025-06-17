import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your political campaigns and team members
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Campaign
        </Link>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(({ campaign, role }) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                <span className="text-xs bg-akashic-primary/10 text-akashic-primary px-2 py-1 rounded">
                  {role}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {campaign.candidateName} • {campaign.office}
              </p>
              
              {campaign.district && (
                <p className="text-sm text-gray-500 mb-4">{campaign.district}</p>
              )}
              
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{campaign._count.messages} messages</span>
                <span>{campaign._count.members} members</span>
              </div>
              
              {campaign.electionDate && (
                <p className="text-xs text-gray-400 mt-4">
                  Election: {new Date(campaign.electionDate).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first campaign to start managing your political messaging
          </p>
          <Link
            href="/campaigns/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Your First Campaign
          </Link>
        </div>
      )}
    </div>
  )
}