import { prisma } from '@/lib/db'

export type ActivityType = 
  | 'MESSAGE_CREATED'
  | 'MESSAGE_UPDATED'
  | 'MESSAGE_DELETED'
  | 'MESSAGE_APPROVED'
  | 'MESSAGE_REJECTED'
  | 'MESSAGE_SCHEDULED'
  | 'MESSAGE_PUBLISHED'
  | 'MESSAGE_UNSCHEDULED'
  | 'CAMPAIGN_CREATED'
  | 'CAMPAIGN_UPDATED'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'TEAM_MEMBER_UPDATED'
  | 'TEMPLATE_CREATED'
  | 'TEMPLATE_UPDATED'
  | 'TEMPLATE_DELETED'
  | 'VERSION_GENERATED'
  | 'ANALYTICS_VIEWED'

interface LogActivityParams {
  campaignId: string
  userId: string
  type: ActivityType
  description: string
  metadata?: any
}

export async function logActivity({
  campaignId,
  userId,
  type,
  description,
  metadata
}: LogActivityParams) {
  try {
    return await prisma.activity.create({
      data: {
        campaignId,
        userId,
        type,
        description,
        metadata
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - we don't want activity logging failures to break the app
    return null
  }
}

// Convenience functions for common activities
export const ActivityLogger = {
  logActivity,
  
  async messageCreated(campaignId: string, userId: string, messageTitle: string, messageId: string) {
    return logActivity({
      campaignId,
      userId,
      type: 'MESSAGE_CREATED',
      description: `created message "${messageTitle}"`,
      metadata: { messageId, messageTitle }
    })
  },

  async messageUpdated(campaignId: string, userId: string, messageTitle: string, messageId: string) {
    return logActivity({
      campaignId,
      userId,
      type: 'MESSAGE_UPDATED',
      description: `updated message "${messageTitle}"`,
      metadata: { messageId, messageTitle }
    })
  },

  async messageApproved(campaignId: string, userId: string, messageTitle: string, messageId: string, comments?: string) {
    return logActivity({
      campaignId,
      userId,
      type: 'MESSAGE_APPROVED',
      description: `approved message "${messageTitle}"`,
      metadata: { messageId, messageTitle, comments }
    })
  },

  async messageRejected(campaignId: string, userId: string, messageTitle: string, messageId: string, comments?: string) {
    return logActivity({
      campaignId,
      userId,
      type: 'MESSAGE_REJECTED',
      description: `rejected message "${messageTitle}"`,
      metadata: { messageId, messageTitle, comments }
    })
  },

  async messageScheduled(campaignId: string, userId: string, messageTitle: string, messageId: string, scheduledFor: Date) {
    return logActivity({
      campaignId,
      userId,
      type: 'MESSAGE_SCHEDULED',
      description: `scheduled message "${messageTitle}"`,
      metadata: { messageId, messageTitle, scheduledFor }
    })
  },

  async messagePublished(campaignId: string, userId: string, messageTitle: string, messageId: string, platforms: string[]) {
    return logActivity({
      campaignId,
      userId,
      type: 'MESSAGE_PUBLISHED',
      description: `published message "${messageTitle}" to ${platforms.join(', ')}`,
      metadata: { messageId, messageTitle, platforms }
    })
  },

  async teamMemberAdded(campaignId: string, userId: string, memberEmail: string, role: string) {
    return logActivity({
      campaignId,
      userId,
      type: 'TEAM_MEMBER_ADDED',
      description: `added ${memberEmail} to the team`,
      metadata: { memberEmail, role }
    })
  },

  async teamMemberRemoved(campaignId: string, userId: string, memberEmail: string) {
    return logActivity({
      campaignId,
      userId,
      type: 'TEAM_MEMBER_REMOVED',
      description: `removed ${memberEmail} from the team`,
      metadata: { memberEmail }
    })
  },

  async versionGenerated(campaignId: string, userId: string, messageTitle: string, versionProfile: string) {
    return logActivity({
      campaignId,
      userId,
      type: 'VERSION_GENERATED',
      description: `generated ${versionProfile} version for "${messageTitle}"`,
      metadata: { messageTitle, versionProfile }
    })
  }
}