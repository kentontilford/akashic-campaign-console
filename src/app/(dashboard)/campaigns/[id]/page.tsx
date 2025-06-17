import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  EnvelopeIcon, 
  ChartBarIcon,
  CogIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'

async function getCampaign(campaignId: string, userId: string) {
  const member = await prisma.campaignMember.findFirst({
    where: {
      campaignId,
      userId
    },
    include: {
      campaign: {
        include: {
          members: {
            include: {
              user: true
            }
          },
          messages: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              author: true
            }
          },
          activities: {
            take: 10,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              user: true
            }
          },
          _count: {
            select: {
              messages: true,
              members: true
            }
          }
        }
      }
    }
  })

  if (!member) {
    return null
  }

  return member
}

export default async function CampaignDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const campaignData = await getCampaign(params.id, session.user.id)
  
  if (!campaignData) {
    notFound()
  }

  const { campaign, role } = campaignData

  const quickActions = [
    {
      name: 'Create Message',
      href: `/messages/new?campaignId=${campaign.id}`,
      icon: EnvelopeIcon,
      color: 'bg-akashic-primary'
    },
    {
      name: 'View Analytics',
      href: `/campaigns/${campaign.id}/analytics`,
      icon: ChartBarIcon,
      color: 'bg-akashic-accent'
    },
    {
      name: 'Team Management',
      href: `/campaigns/${campaign.id}/team`,
      icon: UserGroupIcon,
      color: 'bg-akashic-secondary'
    },
    {
      name: 'Campaign Settings',
      href: `/campaigns/${campaign.id}/settings`,
      icon: CogIcon,
      color: 'bg-gray-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="mt-2 text-lg text-gray-600">
              {campaign.candidateName} • {campaign.office}
            </p>
            {campaign.district && (
              <p className="text-sm text-gray-500">{campaign.district}</p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-akashic-primary/10 text-akashic-primary">
              {role}
            </span>
            {campaign.electionDate && (
              <p className="mt-2 text-sm text-gray-500">
                Election: {new Date(campaign.electionDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Total Messages</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{campaign._count.messages}</dd>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Team Members</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{campaign._count.members}</dd>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Campaign Status</dt>
            <dd className="mt-1 text-2xl font-semibold text-akashic-accent">Active</dd>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-akashic-primary"
            >
              <div className={`flex-shrink-0 rounded-lg p-3 ${action.color}`}>
                <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{action.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Messages */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Messages</h2>
            <Link
              href={`/messages?campaignId=${campaign.id}`}
              className="text-sm text-akashic-primary hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          
          {campaign.messages.length > 0 ? (
            <div className="space-y-3">
              {campaign.messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/messages/${message.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{message.title}</p>
                      <p className="text-sm text-gray-500">
                        {message.author.name || message.author.email} • {message.platform}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      message.status === 'PUBLISHED' 
                        ? 'bg-akashic-accent/10 text-akashic-accent'
                        : message.status === 'APPROVED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No messages yet</p>
              <Link
                href={`/messages/new?campaignId=${campaign.id}`}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                Create First Message
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          
          {campaign.activities.length > 0 ? (
            <div className="space-y-3">
              {campaign.activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <div className="flex-shrink-0 w-2 h-2 bg-akashic-primary rounded-full mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-medium">{activity.user.name || activity.user.email}</span>
                      {' '}{activity.description}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No recent activity</p>
          )}
        </div>
      </div>

      {/* Team Members Preview */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
          <Link
            href={`/campaigns/${campaign.id}/team`}
            className="text-sm text-akashic-primary hover:text-blue-700"
          >
            Manage team
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaign.members.slice(0, 6).map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-akashic-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-akashic-primary">
                    {(member.user.name || member.user.email || '').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.user.name || member.user.email}
                </p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}