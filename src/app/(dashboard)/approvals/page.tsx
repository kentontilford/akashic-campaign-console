import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'
import ApprovalCard from '@/components/messaging/ApprovalCard'
import { canApproveMessages, APPROVAL_ROLES } from '@/lib/permissions'

async function getPendingApprovals(userId: string, userRole: UserRole) {
  // Only certain roles can approve messages
  if (!canApproveMessages(userRole)) {
    return []
  }

  return prisma.message.findMany({
    where: {
      status: 'PENDING_APPROVAL',
      campaign: {
        members: {
          some: { 
            userId,
            role: {
              in: [...APPROVAL_ROLES]
            }
          }
        }
      }
    },
    include: {
      campaign: true,
      author: true,
      approvals: {
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          approvedBy: true
        }
      }
    },
    orderBy: [
      {
        approvalTier: 'desc' // RED first, then YELLOW, then GREEN
      },
      {
        createdAt: 'asc' // Oldest first within each tier
      }
    ]
  })
}

const tierColors = {
  RED: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    description: 'High Risk - Requires careful review'
  },
  YELLOW: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    description: 'Medium Risk - Quick review needed'
  },
  GREEN: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    description: 'Low Risk - Routine approval'
  }
}

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const pendingMessages = await getPendingApprovals(
    session.user.id,
    session.user.role as UserRole
  )

  // Group messages by tier
  const messagesByTier = {
    RED: pendingMessages.filter(m => m.approvalTier === 'RED'),
    YELLOW: pendingMessages.filter(m => m.approvalTier === 'YELLOW'),
    GREEN: pendingMessages.filter(m => m.approvalTier === 'GREEN')
  }

  if (!canApproveMessages(session.user.role as UserRole)) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
        <div className="card text-center py-12">
          <p className="text-gray-500">
            You don't have permission to approve messages.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve pending messages. Messages are sorted by risk level.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(tierColors).map(([tier, config]) => (
          <div key={tier} className={`card ${config.bg} ${config.border} border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tier} Tier</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {messagesByTier[tier as keyof typeof messagesByTier].length}
                </p>
                <p className="text-xs text-gray-500 mt-1">{config.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.badge}`}>
                {tier}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Queue */}
      {pendingMessages.length > 0 ? (
        <div className="space-y-6">
          {['RED', 'YELLOW', 'GREEN'].map((tier) => {
            const messages = messagesByTier[tier as keyof typeof messagesByTier]
            if (messages.length === 0) return null

            const config = tierColors[tier as keyof typeof tierColors]
            
            return (
              <div key={tier}>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${config.badge}`}>
                    {tier} Tier
                  </span>
                  <span className="text-sm text-gray-500">
                    {messages.length} message{messages.length !== 1 ? 's' : ''} pending
                  </span>
                </h2>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ApprovalCard
                      key={message.id}
                      message={message}
                      currentUserId={session.user.id}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
          <p className="text-gray-500">
            All messages have been reviewed. Great job staying on top of approvals!
          </p>
        </div>
      )}
    </div>
  )
}