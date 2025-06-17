import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import TeamMemberCard from '@/components/teams/TeamMemberCard'
import InviteTeamMember from '@/components/teams/InviteTeamMember'
import { canManageTeam, APPROVAL_ROLES } from '@/lib/permissions'

async function getCampaignWithTeam(campaignId: string, userId: string) {
  const member = await prisma.campaignMember.findFirst({
    where: {
      campaignId,
      userId,
      role: {
        in: [UserRole.CANDIDATE, UserRole.CAMPAIGN_MANAGER]
      }
    },
    include: {
      campaign: {
        include: {
          members: {
            include: {
              user: true
            },
            orderBy: [
              {
                role: 'asc'
              },
              {
                joinedAt: 'asc'
              }
            ]
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

const roleDescriptions: Record<UserRole, string> = {
  USER: 'Basic user with limited access',
  CANDIDATE: 'Full access to all campaign features and final approval authority',
  CAMPAIGN_MANAGER: 'Manages overall campaign operations and team',
  COMMUNICATIONS_DIRECTOR: 'Oversees messaging strategy and content creation',
  FIELD_DIRECTOR: 'Manages field operations and volunteer coordination',
  FINANCE_DIRECTOR: 'Handles fundraising and financial operations',
  VOLUNTEER: 'Assists with various campaign activities',
  ADMIN: 'System administrator with full access'
}

const roleColors: Record<UserRole, string> = {
  USER: 'bg-gray-100 text-gray-700',
  CANDIDATE: 'bg-purple-100 text-purple-700',
  CAMPAIGN_MANAGER: 'bg-blue-100 text-blue-700',
  COMMUNICATIONS_DIRECTOR: 'bg-green-100 text-green-700',
  FIELD_DIRECTOR: 'bg-yellow-100 text-yellow-700',
  FINANCE_DIRECTOR: 'bg-orange-100 text-orange-700',
  VOLUNTEER: 'bg-gray-100 text-gray-700',
  ADMIN: 'bg-red-100 text-red-700'
}

export default async function TeamManagementPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const campaignData = await getCampaignWithTeam(params.id, session.user.id)
  
  if (!campaignData) {
    notFound()
  }

  const { campaign, role: userRole } = campaignData
  const canManage = canManageTeam(userRole)

  // Group members by role
  const membersByRole = campaign.members.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = []
    }
    acc[member.role].push(member)
    return acc
  }, {} as Record<UserRole, typeof campaign.members>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            {campaign.name} • {campaign.members.length} team members
          </p>
        </div>
        
        {canManage && (
          <InviteTeamMember campaignId={campaign.id} />
        )}
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Total Members</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{campaign.members.length}</dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Leadership Roles</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {campaign.members.filter(m => 
              (APPROVAL_ROLES as readonly UserRole[]).includes(m.role)
            ).length}
          </dd>
        </div>
        <div className="card">
          <dt className="text-sm font-medium text-gray-500">Volunteers</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {campaign.members.filter(m => m.role === UserRole.VOLUNTEER).length}
          </dd>
        </div>
      </div>

      {/* Team Members by Role */}
      <div className="space-y-8">
        {Object.entries(membersByRole).map(([role, members]) => (
          <div key={role}>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[role as UserRole]}`}>
                  {role.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {roleDescriptions[role as keyof typeof roleDescriptions]}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  canManage={canManage && member.userId !== session.user.id}
                  currentUserId={session.user.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {campaign.members.length === 0 && (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-6">
            Invite team members to collaborate on your campaign
          </p>
          {canManage && (
            <InviteTeamMember campaignId={campaign.id} />
          )}
        </div>
      )}
    </div>
  )
}